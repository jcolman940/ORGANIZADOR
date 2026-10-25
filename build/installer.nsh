; Al desinstalar, quitar la entrada de arranque con Windows que crea la app.
; El nombre del valor es el AppUserModelId (src/main/index.ts, APP_ID).
!macro customUnInstall
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "com.julian.organizador"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" "com.julian.organizador"
!macroend
