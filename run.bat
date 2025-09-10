@echo off
start cmd /k "cd Comic && mvnd spring-boot:run -e"
start cmd /k "cd ComicReaderSite && npm run dev"
