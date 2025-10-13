@echo off
start cmd /k "cd Comic && mvn spring-boot:run"
start cmd /k "cd ComicReaderSite && npm run dev"
