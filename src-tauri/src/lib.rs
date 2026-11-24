//! Krome's native layer. Learn more about Tauri commands at
//! https://tauri.app/develop/calling-rust/
pub mod helios;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Shared Helios client used by `start_helios` and `get_latest_block`.
        .manage(helios::HeliosState::default())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            helios::start_helios,
            helios::get_latest_block
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
