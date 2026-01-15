use flate2::read::ZlibDecoder;
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Read;
use std::path::PathBuf;
use std::process::Command;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize)]
pub struct GovernanceResult {
    pub status: String,
    pub action: String,
    pub confidence: f64,
    pub reason: String,
    pub audit_ref: String,
    pub ontological_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TruthGitResponse {
    success: bool,
    data: Option<GovernanceResult>,
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claim {
    pub content: String,
    pub confidence: f64,
    pub category: String,
    pub domain: String,
    pub state: String,
    #[serde(rename = "$hash")]
    pub hash: String,
    #[serde(rename = "$type")]
    pub claim_type: String,
    pub metadata: ClaimMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClaimMetadata {
    pub language: Option<String>,
    pub tags: Option<Vec<String>>,
    pub created_at: Option<String>,
    pub created_by: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TruthRepoStatus {
    pub exists: bool,
    pub path: String,
    pub claims_count: usize,
    pub head_ref: Option<String>,
    pub has_keys: bool,
}

fn get_truth_path() -> Option<PathBuf> {
    dirs::home_dir().map(|h| h.join("Almacen_IA/LumenSyntax-Main/.truth"))
}

fn decompress_object(path: &PathBuf) -> Result<serde_json::Value, String> {
    let file = File::open(path).map_err(|e| format!("Failed to open file: {}", e))?;

    let mut decoder = ZlibDecoder::new(file);
    let mut decompressed = String::new();
    decoder
        .read_to_string(&mut decompressed)
        .map_err(|e| format!("Failed to decompress: {}", e))?;

    serde_json::from_str(&decompressed)
        .map_err(|e| format!("Failed to parse JSON: {}", e))
}

#[tauri::command]
async fn governance_verify(
    claim: String,
    domain: String,
    risk_profile: String,
) -> Result<GovernanceResult, String> {
    let client = reqwest::Client::new();

    let api_url = std::env::var("TRUTHGIT_API_URL")
        .unwrap_or_else(|_| "https://truthgit-api-342668283383.us-central1.run.app".to_string());

    let response = client
        .post(format!("{}/api/governance/verify", api_url))
        .json(&serde_json::json!({
            "claim": claim,
            "domain": domain,
            "risk_profile": risk_profile,
        }))
        .send()
        .await
        .map_err(|e| format!("Failed to connect to TruthGit API: {}", e))?;

    let result: TruthGitResponse = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    if let Some(data) = result.data {
        Ok(data)
    } else {
        Err(result.error.unwrap_or_else(|| "Unknown error".to_string()))
    }
}

#[tauri::command]
async fn list_claims() -> Result<Vec<serde_json::Value>, String> {
    let truth_path = get_truth_path().ok_or("Could not find home directory")?;
    let claims_dir = truth_path.join("objects/cl");

    if !claims_dir.exists() {
        return Ok(vec![]);
    }

    let mut claims = Vec::new();

    for entry in WalkDir::new(&claims_dir)
        .min_depth(2)
        .max_depth(2)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            match decompress_object(&entry.path().to_path_buf()) {
                Ok(claim) => claims.push(claim),
                Err(e) => log::warn!("Failed to read claim {}: {}", entry.path().display(), e),
            }
        }
    }

    // Sort by created_at descending (newest first)
    claims.sort_by(|a, b| {
        let a_time = a.get("metadata")
            .and_then(|m| m.get("created_at"))
            .and_then(|t| t.as_str())
            .unwrap_or("");
        let b_time = b.get("metadata")
            .and_then(|m| m.get("created_at"))
            .and_then(|t| t.as_str())
            .unwrap_or("");
        b_time.cmp(a_time)
    });

    Ok(claims)
}

#[tauri::command]
async fn get_claim(hash: String) -> Result<serde_json::Value, String> {
    let truth_path = get_truth_path().ok_or("Could not find home directory")?;

    if hash.len() < 3 {
        return Err("Invalid hash".to_string());
    }

    let prefix = &hash[..2];
    let suffix = &hash[2..];
    let claim_path = truth_path.join("objects/cl").join(prefix).join(suffix);

    if !claim_path.exists() {
        return Err(format!("Claim not found: {}", hash));
    }

    decompress_object(&claim_path)
}

#[tauri::command]
async fn get_truth_status() -> Result<TruthRepoStatus, String> {
    let truth_path = get_truth_path().ok_or("Could not find home directory")?;

    if !truth_path.exists() {
        return Ok(TruthRepoStatus {
            exists: false,
            path: truth_path.to_string_lossy().to_string(),
            claims_count: 0,
            head_ref: None,
            has_keys: false,
        });
    }

    // Count claims
    let claims_dir = truth_path.join("objects/cl");
    let claims_count = if claims_dir.exists() {
        WalkDir::new(&claims_dir)
            .min_depth(2)
            .max_depth(2)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .count()
    } else {
        0
    };

    // Read HEAD
    let head_path = truth_path.join("HEAD");
    let head_ref = fs::read_to_string(&head_path).ok();

    // Check for keys
    let has_keys = truth_path.join("proof.key").exists()
        && truth_path.join("proof.pub").exists();

    Ok(TruthRepoStatus {
        exists: true,
        path: truth_path.to_string_lossy().to_string(),
        claims_count,
        head_ref,
        has_keys,
    })
}

#[tauri::command]
async fn run_truthgit_command(args: Vec<String>) -> Result<String, String> {
    let output = Command::new("truthgit")
        .args(&args)
        .output()
        .map_err(|e| format!("Failed to run truthgit: {}", e))?;

    if output.status.success() {
        String::from_utf8(output.stdout)
            .map_err(|e| format!("Invalid UTF-8 output: {}", e))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("TruthGit error: {}", stderr))
    }
}

#[tauri::command]
async fn verify_claim_local(claim: String, domain: String) -> Result<String, String> {
    let output = Command::new("truthgit")
        .args(["verify", &claim, "--domain", &domain, "--json"])
        .output()
        .map_err(|e| format!("Failed to run truthgit: {}", e))?;

    if output.status.success() {
        String::from_utf8(output.stdout)
            .map_err(|e| format!("Invalid UTF-8 output: {}", e))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Verification failed: {}", stderr))
    }
}

#[tauri::command]
async fn list_verifications() -> Result<Vec<serde_json::Value>, String> {
    let truth_path = get_truth_path().ok_or("Could not find home directory")?;
    let verifications_dir = truth_path.join("objects/vf");

    if !verifications_dir.exists() {
        return Ok(vec![]);
    }

    let mut verifications = Vec::new();

    for entry in WalkDir::new(&verifications_dir)
        .min_depth(2)
        .max_depth(2)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        if entry.file_type().is_file() {
            match decompress_object(&entry.path().to_path_buf()) {
                Ok(vf) => verifications.push(vf),
                Err(e) => log::warn!("Failed to read verification {}: {}", entry.path().display(), e),
            }
        }
    }

    // Sort by timestamp descending
    verifications.sort_by(|a, b| {
        let a_time = a.get("timestamp")
            .and_then(|t| t.as_str())
            .unwrap_or("");
        let b_time = b.get("timestamp")
            .and_then(|t| t.as_str())
            .unwrap_or("");
        b_time.cmp(a_time)
    });

    Ok(verifications)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuditEntry {
    pub id: String,
    pub timestamp: String,
    pub action: String,
    pub claim: String,
    pub domain: String,
    pub risk_profile: String,
    pub result_status: String,
    pub result_action: String,
    pub confidence: f64,
}

#[tauri::command]
async fn get_audit_trail() -> Result<Vec<AuditEntry>, String> {
    let truth_path = get_truth_path().ok_or("Could not find home directory")?;
    let audit_file = truth_path.join("audit.json");

    if !audit_file.exists() {
        return Ok(vec![]);
    }

    let content = fs::read_to_string(&audit_file)
        .map_err(|e| format!("Failed to read audit file: {}", e))?;

    let entries: Vec<AuditEntry> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse audit file: {}", e))?;

    Ok(entries)
}

#[tauri::command]
async fn add_audit_entry(entry: AuditEntry) -> Result<(), String> {
    let truth_path = get_truth_path().ok_or("Could not find home directory")?;
    let audit_file = truth_path.join("audit.json");

    let mut entries: Vec<AuditEntry> = if audit_file.exists() {
        let content = fs::read_to_string(&audit_file)
            .map_err(|e| format!("Failed to read audit file: {}", e))?;
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        vec![]
    };

    entries.insert(0, entry);

    let content = serde_json::to_string_pretty(&entries)
        .map_err(|e| format!("Failed to serialize audit: {}", e))?;

    fs::write(&audit_file, content)
        .map_err(|e| format!("Failed to write audit file: {}", e))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            governance_verify,
            list_claims,
            get_claim,
            get_truth_status,
            run_truthgit_command,
            verify_claim_local,
            list_verifications,
            get_audit_trail,
            add_audit_entry,
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
