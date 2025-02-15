// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod helios;

use std::sync::Mutex;
use helios::HeliosState;
use tauri_plugin_path_resolver;

fn main() {
    tauri::Builder::default()
        .manage(HeliosState(Mutex::new(None)))
        .plugin(tauri_plugin_path_resolver::init())
        .invoke_handler(tauri::generate_handler![
            helios::start_helios,
            helios::get_latest_block,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
