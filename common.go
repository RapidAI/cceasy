package main

var trayTranslations = map[string]map[string]string{
	"en": {
		"title":   "AICoder Dashboard",
		"show":    "Show AICoder",
		"launch":  "Launch Claude Code",
		"quit":    "Quit AICoder",
		"models":  "Providers",
		"actions": "Actions",
	},
	"zh-Hans": {
		"title":   "AICoder 控制台",
		"show":    "显示主窗口",
		"launch":  "启动 Claude Code",
		"quit":    "退出程序",
		"models":  "服务商选择",
		"actions": "操作",
	},
	"zh-Hant": {
		"title":   "AICoder 控制台",
		"show":    "顯示主視窗",
		"launch":  "啟動 Claude Code",
		"quit":    "退出程式",
		"models":  "服務商選擇",
		"actions": "操作",
	},
	"ko": {
		"title":   "AICoder 대시보드",
		"show":    "메인 창 표시",
		"launch":  "Claude Code 시작",
		"quit":    "프로그램 종료",
		"models":  "서비스 제공자",
		"actions": "작업",
	},
	"ja": {
		"title":   "AICoder ダッシュボード",
		"show":    "メインウィンドウを表示",
		"launch":  "Claude Code を起動",
		"quit":    "終了",
		"models":  "プロバイダー選択",
		"actions": "操作",
	},
	"de": {
		"title":   "AICoder Dashboard",
		"show":    "Hauptfenster anzeigen",
		"launch":  "Claude Code starten",
		"quit":    "Beenden",
		"models":  "Anbieter",
		"actions": "Aktionen",
	},
	"fr": {
		"title":   "Tableau de bord AICoder",
		"show":    "Afficher la fenêtre principale",
		"launch":  "Lancer Claude Code",
		"quit":    "Quitter",
		"models":  "Fournisseurs",
		"actions": "Actions",
	},
}

const RequiredNodeVersion = "22.14.0"