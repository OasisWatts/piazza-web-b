/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/common/applicationCode.ts":
/*!***************************************!*\
  !*** ./src/common/applicationCode.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.BOARD_CATEGORY = exports.ErrorCode = void 0;\nvar ErrorCode;\n(function (ErrorCode) {\n    ErrorCode[ErrorCode[\"follow_self\"] = 0] = \"follow_self\";\n    ErrorCode[ErrorCode[\"max_friends\"] = 1] = \"max_friends\";\n    ErrorCode[ErrorCode[\"follow_failed\"] = 2] = \"follow_failed\";\n    ErrorCode[ErrorCode[\"unfollow_failed\"] = 3] = \"unfollow_failed\";\n    ErrorCode[ErrorCode[\"block_add_failed\"] = 4] = \"block_add_failed\";\n    ErrorCode[ErrorCode[\"block_delete_failed\"] = 5] = \"block_delete_failed\";\n    ErrorCode[ErrorCode[\"block_already\"] = 6] = \"block_already\";\n    ErrorCode[ErrorCode[\"block_self\"] = 7] = \"block_self\";\n    ErrorCode[ErrorCode[\"max_blocks\"] = 8] = \"max_blocks\";\n    ErrorCode[ErrorCode[\"user_unfound\"] = 9] = \"user_unfound\";\n    ErrorCode[ErrorCode[\"user_find_failed\"] = 10] = \"user_find_failed\";\n    ErrorCode[ErrorCode[\"user_save_failed\"] = 11] = \"user_save_failed\";\n    ErrorCode[ErrorCode[\"user_delete_failed\"] = 12] = \"user_delete_failed\";\n    ErrorCode[ErrorCode[\"token_failed\"] = 13] = \"token_failed\";\n    ErrorCode[ErrorCode[\"board_delete_failed\"] = 14] = \"board_delete_failed\";\n    ErrorCode[ErrorCode[\"board_update_failed\"] = 15] = \"board_update_failed\";\n    ErrorCode[ErrorCode[\"board_update_bad_request\"] = 16] = \"board_update_bad_request\";\n    ErrorCode[ErrorCode[\"board_insert_failed\"] = 17] = \"board_insert_failed\";\n    ErrorCode[ErrorCode[\"board_find_failed\"] = 18] = \"board_find_failed\";\n    ErrorCode[ErrorCode[\"comment_find_failed\"] = 19] = \"comment_find_failed\";\n    ErrorCode[ErrorCode[\"comment_insert_failed\"] = 20] = \"comment_insert_failed\";\n    ErrorCode[ErrorCode[\"comment_update_failed\"] = 21] = \"comment_update_failed\";\n    ErrorCode[ErrorCode[\"comment_update_bad_request\"] = 22] = \"comment_update_bad_request\";\n    ErrorCode[ErrorCode[\"comment_delete_failed\"] = 23] = \"comment_delete_failed\";\n    ErrorCode[ErrorCode[\"hashtag_failed\"] = 24] = \"hashtag_failed\";\n    ErrorCode[ErrorCode[\"user_hashtag_failed\"] = 25] = \"user_hashtag_failed\";\n    ErrorCode[ErrorCode[\"url_find_failed\"] = 26] = \"url_find_failed\";\n    ErrorCode[ErrorCode[\"follow_find_failed\"] = 27] = \"follow_find_failed\";\n    ErrorCode[ErrorCode[\"follow_recommend_find_failed\"] = 28] = \"follow_recommend_find_failed\";\n    ErrorCode[ErrorCode[\"api_failed\"] = 29] = \"api_failed\";\n    ErrorCode[ErrorCode[\"refreshToken_create_failed\"] = 30] = \"refreshToken_create_failed\";\n    ErrorCode[ErrorCode[\"verify_token_failed\"] = 31] = \"verify_token_failed\";\n})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));\nvar BOARD_CATEGORY;\n(function (BOARD_CATEGORY) {\n    BOARD_CATEGORY[BOARD_CATEGORY[\"myBoards\"] = 0] = \"myBoards\";\n    BOARD_CATEGORY[BOARD_CATEGORY[\"myUpBoards\"] = 1] = \"myUpBoards\";\n    BOARD_CATEGORY[BOARD_CATEGORY[\"urlBoards\"] = 2] = \"urlBoards\";\n    BOARD_CATEGORY[BOARD_CATEGORY[\"feed\"] = 3] = \"feed\";\n    BOARD_CATEGORY[BOARD_CATEGORY[\"searchBoards\"] = 4] = \"searchBoards\";\n    BOARD_CATEGORY[BOARD_CATEGORY[\"userBoards\"] = 5] = \"userBoards\";\n})(BOARD_CATEGORY || (exports.BOARD_CATEGORY = BOARD_CATEGORY = {}));\n\n\n//# sourceURL=webpack://flutter_browser_back/./src/common/applicationCode.ts?");

/***/ }),

/***/ "./src/common/unitDate.ts":
/*!********************************!*\
  !*** ./src/common/unitDate.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.DayOfWeek = exports.UnitDate = void 0;\n/** 시간 단위 (ms) */\nvar UnitDate;\n(function (UnitDate) {\n    UnitDate[UnitDate[\"MILLISECOND\"] = 1] = \"MILLISECOND\";\n    UnitDate[UnitDate[\"SECOND\"] = 1000] = \"SECOND\";\n    UnitDate[UnitDate[\"MINUTE\"] = 60000] = \"MINUTE\";\n    UnitDate[UnitDate[\"HOUR\"] = 3600000] = \"HOUR\";\n    UnitDate[UnitDate[\"DAY\"] = 86400000] = \"DAY\";\n    UnitDate[UnitDate[\"WEEK\"] = 604800000] = \"WEEK\";\n    UnitDate[UnitDate[\"MONTH\"] = 2629743840] = \"MONTH\";\n    UnitDate[UnitDate[\"YEAR\"] = 31556926080] = \"YEAR\";\n})(UnitDate || (exports.UnitDate = UnitDate = {}));\n/** 요일 */\nvar DayOfWeek;\n(function (DayOfWeek) {\n    DayOfWeek[DayOfWeek[\"SUN\"] = 0] = \"SUN\";\n    DayOfWeek[DayOfWeek[\"MON\"] = 1] = \"MON\";\n    DayOfWeek[DayOfWeek[\"TUE\"] = 2] = \"TUE\";\n    DayOfWeek[DayOfWeek[\"WED\"] = 3] = \"WED\";\n    DayOfWeek[DayOfWeek[\"THU\"] = 4] = \"THU\";\n    DayOfWeek[DayOfWeek[\"FRI\"] = 5] = \"FRI\";\n    DayOfWeek[DayOfWeek[\"SAT\"] = 6] = \"SAT\";\n})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));\n\n\n//# sourceURL=webpack://flutter_browser_back/./src/common/unitDate.ts?");

/***/ }),

/***/ "./src/process.ts":
/*!************************!*\
  !*** ./src/process.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nvar _a, _b;\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst logger_1 = __webpack_require__(/*! ./util/logger */ \"./src/util/logger.ts\");\nconst child_process_1 = __importDefault(__webpack_require__(/*! child_process */ \"child_process\"));\nconst { spawn } = child_process_1.default;\nconst processWeb = spawn(\"node\", [\"./main.js\", \"-remote\"]);\nif (processWeb) {\n    (_a = processWeb.stdout) === null || _a === void 0 ? void 0 : _a.on(\"data\", (data) => {\n        console.log(data.toString());\n    });\n    (_b = processWeb.stderr) === null || _b === void 0 ? void 0 : _b.on(\"data\", (data) => {\n        console.log(data.toString());\n    });\n    processWeb.on(\"exit\", (code, signal) => {\n        logger_1.Logger.errorSignificant(\"Process\").put(`web process terminated, exit code: ${code}, signal: ${signal}`).out();\n    });\n}\n\n\n//# sourceURL=webpack://flutter_browser_back/./src/process.ts?");

/***/ }),

/***/ "./src/util/logger.ts":
/*!****************************!*\
  !*** ./src/util/logger.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || function (mod) {\n    if (mod && mod.__esModule) return mod;\n    var result = {};\n    if (mod != null) for (var k in mod) if (k !== \"default\" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);\n    __setModuleDefault(result, mod);\n    return result;\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.LogStyle = exports.Logger = exports.LogLevel = exports.LogColor = void 0;\nconst unitDate_1 = __webpack_require__(/*! common/unitDate */ \"./src/common/unitDate.ts\");\nconst utility_1 = __webpack_require__(/*! ./utility */ \"./src/util/utility.ts\");\nconst applicationCode_1 = __webpack_require__(/*! common/applicationCode */ \"./src/common/applicationCode.ts\");\nlet fs;\nlet setting;\n/**\n * 로그의 색 열거형.\n *\n * ANSI 탈출 구문 `\\x1b[?m`의 `?`에 들어갈 값과 같도록 설정되어 있다.\n */\nvar LogColor;\n(function (LogColor) {\n    LogColor[LogColor[\"NORMAL\"] = 0] = \"NORMAL\";\n    LogColor[LogColor[\"BRIGHT\"] = 1] = \"BRIGHT\";\n    LogColor[LogColor[\"DIM\"] = 2] = \"DIM\";\n    LogColor[LogColor[\"UNDERSCORE\"] = 4] = \"UNDERSCORE\";\n    LogColor[LogColor[\"F_BLACK\"] = 30] = \"F_BLACK\";\n    LogColor[LogColor[\"F_RED\"] = 31] = \"F_RED\";\n    LogColor[LogColor[\"F_GREEN\"] = 32] = \"F_GREEN\";\n    LogColor[LogColor[\"F_YELLOW\"] = 33] = \"F_YELLOW\";\n    LogColor[LogColor[\"F_BLUE\"] = 34] = \"F_BLUE\";\n    LogColor[LogColor[\"F_MAGENTA\"] = 35] = \"F_MAGENTA\";\n    LogColor[LogColor[\"F_CYAN\"] = 36] = \"F_CYAN\";\n    LogColor[LogColor[\"F_WHITE\"] = 37] = \"F_WHITE\";\n    LogColor[LogColor[\"B_BLACK\"] = 40] = \"B_BLACK\";\n    LogColor[LogColor[\"B_RED\"] = 41] = \"B_RED\";\n    LogColor[LogColor[\"B_GREEN\"] = 42] = \"B_GREEN\";\n    LogColor[LogColor[\"B_YELLOW\"] = 43] = \"B_YELLOW\";\n    LogColor[LogColor[\"B_BLUE\"] = 44] = \"B_BLUE\";\n    LogColor[LogColor[\"B_MAGENTA\"] = 45] = \"B_MAGENTA\";\n    LogColor[LogColor[\"B_CYAN\"] = 46] = \"B_CYAN\";\n    LogColor[LogColor[\"B_WHITE\"] = 47] = \"B_WHITE\";\n})(LogColor || (exports.LogColor = LogColor = {}));\n/**\n * 로그의 수준 열거형.\n *\n * 수준에 따라 표시되는 아이콘이 달라지며, `ERROR` 수준이라고 해도 출력 후 자동으로 종료되지 않는다.\n */\nvar LogLevel;\n(function (LogLevel) {\n    LogLevel[LogLevel[\"APP_PASS\"] = 0] = \"APP_PASS\";\n    LogLevel[LogLevel[\"SIG_PASS\"] = 1] = \"SIG_PASS\";\n    LogLevel[LogLevel[\"APP_ERROR\"] = 2] = \"APP_ERROR\";\n    LogLevel[LogLevel[\"SIG_ERROR\"] = 3] = \"SIG_ERROR\";\n})(LogLevel || (exports.LogLevel = LogLevel = {}));\n/**\n * 로그를 출력해 주는 유틸리티 클래스.\n *\n * 로그 수준에 따라 `Logger.log()`, `Logger.info()`, `Logger.success()`, `Logger.warning()`, `Logger.error()` 메소드를\n * 호출할 수 있으며, 그 반환값으로 `Logger` 인스턴스를 얻을 수 있다.\n * 인스턴스의 메소드를 이용해 로그 내용을 입력한 후 `out()` 메소드를 호출하는 것으로 최종적으로 출력이 된다.\n *\n * 클라이언트 측과 서버 측 모두 로그 출력에 쓸 수 있으며,\n * 서버가 로그를 출력하려는 경우 `Logger.initialize()` 메소드로 초기화함으로써\n * 로그 내용을 파일로 보관할 수 있다.\n */\nclass Logger {\n    /**\n     * 로그 시스템을 초기화하고 파일에 쓸 준비를 한다.\n     *\n     * 설정 파일에서 정한 값에 따라 로그 파일 이름과 파일 교체 주기가 결정된다.\n     * 설정 파일의 교체 주기가 0으로 설정된 경우 로그 파일을 생성하지 않는다.\n     *\n     * @param subject 주체의 식별자. 로그 디렉토리의 하위 디렉토리 이름으로 쓰인다.\n     */\n    static async initialize(subject) {\n        fs = await Promise.resolve().then(() => __importStar(__webpack_require__(/*! fs */ \"fs\")));\n        setting = await Promise.resolve().then(() => __importStar(__webpack_require__(/*! util/setting */ \"./src/util/setting.ts\")));\n        Logger.subject = subject;\n        if (!fs.existsSync(Logger.directoryPath)) {\n            fs.mkdirSync(Logger.directoryPath, { recursive: true });\n        }\n        if (setting.SETTINGS.log.interval) {\n            setting.schedule(Logger.shiftFile, setting.SETTINGS.log.interval, {\n                callAtStart: true,\n                punctual: true,\n            });\n        }\n        else\n            Logger.errorSignificant().put(\"Log files won't be generated.\").out();\n    }\n    /**\n     * 치명적인 오류 로그 인스턴스.\n     *\n     * @param title 제목.\n     */\n    static errorSignificant(title) {\n        return new Logger(LogLevel.SIG_ERROR, title);\n    }\n    /**\n     * 앱 오류 로그 인스턴스.\n     *\n     * @param title 제목.\n     */\n    static errorApp(c) {\n        return new Logger(LogLevel.APP_ERROR, applicationCode_1.ErrorCode[c]);\n    }\n    /**\n     * 앱 패스 로그 인스턴스.\n     *\n     * @param title 제목.\n     */\n    static passApp(title) {\n        return new Logger(LogLevel.APP_PASS, title);\n    }\n    /**\n     * 앱 패스 로그 인스턴스.\n     *\n     * @param title 제목.\n     */\n    static passSignificant(title) {\n        return new Logger(LogLevel.SIG_PASS, title);\n    }\n    static escape(style = LogStyle.NORMAL) {\n        return style.reduce((pv, v) => `${pv}\\x1b[${v}m`, \"\");\n    }\n    static getCaller() {\n        var _a;\n        const error = (_a = new Error().stack) === null || _a === void 0 ? void 0 : _a.split(\"\\n\");\n        if (error) {\n            for (let level = 4; level < error.length; level++) {\n                let chunk;\n                if (chunk = error[level].match(Logger.REGEXP_CALLER)) {\n                    return {\n                        file: chunk[2],\n                        line: Number(chunk[3]),\n                        function: chunk[1],\n                    };\n                }\n                if (chunk = error[level].match(Logger.REGEXP_CALLER_ANONYMOUS)) {\n                    return {\n                        file: chunk[1],\n                        line: Number(chunk[2]),\n                        function: `:${chunk[3]} (Unknown)`,\n                    };\n                }\n            }\n        }\n        return null;\n    }\n    static getLocalFileNameDate() {\n        const now = new Date();\n        return [\n            String(now.getFullYear() % 100).padStart(2, \"0\"),\n            String(now.getMonth() + 1).padStart(2, \"0\"),\n            String(now.getDate()).padStart(2, \"0\"),\n            \"-\",\n            String(now.getHours()).padStart(2, \"0\"),\n            String(now.getMinutes()).padStart(2, \"0\"),\n            String(now.getSeconds()).padStart(2, \"0\"),\n        ].join(\"\");\n    }\n    static getLocalISODate() {\n        const now = new Date();\n        const offset = -Math.round(utility_1.TIMEZONE_OFFSET / unitDate_1.UnitDate.HOUR) || \"\";\n        return new Date(now.getTime() - utility_1.TIMEZONE_OFFSET).toISOString() + (offset && (0, utility_1.toSignedString)(offset));\n    }\n    static shiftFile() {\n        const fileName = Logger.getLocalFileNameDate();\n        const path = `${Logger.directoryPath}/${fileName}.log`;\n        if (Logger.recentFileInfo) {\n            Logger.recentFileInfo.stream.end();\n        }\n        Logger.recentFileInfo = {\n            stream: fs.createWriteStream(path),\n            path,\n            createdAt: Date.now(),\n        };\n        Logger.passApp(Logger.subject).next(\"Path\").put(fileName).out();\n    }\n    static get directoryPath() {\n        return `${__dirname}/../../${setting.SETTINGS.log.directory}/${Logger.subject}`;\n    }\n    constructor(type = LogLevel.APP_PASS, title = \"\") {\n        this.head = \"\";\n        const caller = Logger.getCaller();\n        this.type = type;\n        this.list = [];\n        this.timestamp = `[${Logger.getLocalISODate()}]`;\n        this.chunk = [];\n        this.putS(LogStyle.TIMESTAMP, this.timestamp);\n        if (caller) {\n            let fileLimit = Logger.CALLER_LENGTH - String(caller.line).length;\n            this.putS(LogStyle.CALLER_FILE, \" \", (0, utility_1.cut)(caller.file, fileLimit).padStart(fileLimit, \" \"));\n            this.putS(LogStyle.CALLER_LINE, \":\", caller.line, \" \");\n            this.putS(LogStyle.CALLER, (0, utility_1.cut)(caller.function, Logger.CALLER_LENGTH).padEnd(Logger.CALLER_LENGTH, \" \"), \" \");\n        }\n        switch (type) {\n            case LogLevel.APP_PASS:\n                this.putS(LogStyle.TYPE_NORMAL, \"(:)\");\n                break;\n            case LogLevel.APP_ERROR:\n                this.putS(LogStyle.TYPE_WARNING, \"(△)\");\n                break;\n            case LogLevel.SIG_PASS:\n                this.putS(LogStyle.TYPE_SUCCESS, \"(✓)\");\n                break;\n            case LogLevel.SIG_ERROR:\n                this.putS(LogStyle.TYPE_ERROR, \"(×)\");\n                break;\n        }\n        if (title) {\n            this.putS(LogStyle.TITLE, \" [\", title, \"]\");\n        }\n        this.put(\" \");\n    }\n    getText() {\n        const maxDigit = this.list.reduce((pv, v) => { var _a; return (pv < ((_a = v[0]) === null || _a === void 0 ? void 0 : _a.length) ? v[0].length : pv); }, 1);\n        const prefix = \" \".repeat(this.timestamp.length + 2 * Logger.CALLER_LENGTH + 5);\n        const last = this.list.length - 2;\n        return [\n            this.list[0][1],\n            ...this.list.slice(1).map(([head, body], i) => `${prefix}${Logger.escape(LogStyle.LINE)}${i === last ? \"└\" : \"├\"}─ ${(head !== null && head !== void 0 ? head : String(i)).padEnd(maxDigit, \" \")}${Logger.escape()}: ${body}`),\n        ].join(\"\\n\");\n    }\n    /**\n     * 이후 내용을 다음 줄에 기록하도록 하고 사슬 반환한다.\n     *\n     * @param head 다음 줄의 제목.\n     */\n    next(head) {\n        this.list.push([this.head, this.chunk.join(\"\")]);\n        this.head = head;\n        this.chunk = [];\n        return this;\n    }\n    /**\n     * 기록된 내용을 출력한다.\n     *\n     * 클라이언트나 파일에 출력하는 경우 ANSI 탈출 구문을 지원하지 않으므로 내용을 일부 수정해 출력한다.\n     */\n    out() {\n        if (this.chunk.length) {\n            this.next(\"\");\n        }\n        let text = this.getText();\n        const args = [];\n        if (utility_1.FRONT) {\n            text = text.replace(Logger.REGEXP_ANSI_ESCAPE, (v, p1) => {\n                args.push(Logger.WEBKIT_STYLE_TABLE[p1]);\n                return \"%c\";\n            });\n        }\n        else if (Logger.recentFileInfo) {\n            Logger.recentFileInfo.stream.write(`${text.replace(Logger.REGEXP_ANSI_ESCAPE, \"\")}\\n`);\n        }\n        switch (this.type) {\n            case LogLevel.APP_PASS:\n                console.log(text, ...args);\n                break;\n            case LogLevel.APP_ERROR:\n                console.warn(text, ...args);\n                break;\n            case LogLevel.SIG_ERROR:\n                console.error(text, ...args);\n                break;\n        }\n    }\n    /**\n     * 현재 줄에 내용을 추가하고 사슬 반환한다.\n     *\n     * 여러 인자에 걸쳐 내용이 들어오는 경우 공백 없이 붙여서 출력된다.\n     *\n     * @param args 추가할 내용.\n     */\n    put(arg) {\n        this.chunk.push(arg + \" \");\n        return this;\n    }\n    /**\n     * 현재 줄에 주어진 색 조합을 따르는 내용을 추가하고 사슬 반환한다.\n     *\n     * 여러 인자에 걸쳐 내용이 들어오는 경우 공백 없이 붙여서 출력된다.\n     * ANSI 탈출 구문을 지원하지 않는 매체에 출력하는 경우 색 조합이 무시될 수 있다.\n     *\n     * @param value 색 조합.\n     * @param args 추가할 내용.\n     */\n    putS(value, ...args) {\n        this.chunk.push(Logger.escape(value), ...args, Logger.escape());\n        return this;\n    }\n}\nexports.Logger = Logger;\nLogger.REGEXP_ANSI_ESCAPE = /\\x1b\\[(\\d+)m/g;\n// 캡처되는 그룹 { 함수명, 파일명, 줄 번호 }\nLogger.REGEXP_CALLER = /^\\s*at (.+) \\(.+?([^\\\\/]+):(\\d+):\\d+\\)$/;\n// 캡처되는 그룹 { 파일명, 줄 번호, 칸 번호 }\nLogger.REGEXP_CALLER_ANONYMOUS = /^\\s*at .+?([^\\\\/]+):(\\d+):(\\d+)$/;\nLogger.CALLER_LENGTH = 20;\nLogger.WEBKIT_STYLE_TABLE = {\n    [LogColor.NORMAL]: \"\",\n    [LogColor.BRIGHT]: \"font-weight: bold\",\n    [LogColor.DIM]: \"font-style: italic\",\n    [LogColor.UNDERSCORE]: \"text-decoration: underline\",\n    [LogColor.F_BLACK]: \"color: black\",\n    [LogColor.F_RED]: \"color: red\",\n    [LogColor.F_GREEN]: \"color: green\",\n    [LogColor.F_YELLOW]: \"color: yellow\",\n    [LogColor.F_BLUE]: \"color: blue\",\n    [LogColor.F_MAGENTA]: \"color: magenta\",\n    [LogColor.F_CYAN]: \"color: deepskyblue\",\n    [LogColor.F_WHITE]: \"color: white\",\n    [LogColor.B_BLACK]: \"background: black\",\n    [LogColor.B_RED]: \"background: red\",\n    [LogColor.B_GREEN]: \"background: green\",\n    [LogColor.B_YELLOW]: \"background: yellow\",\n    [LogColor.B_BLUE]: \"background: blue\",\n    [LogColor.B_MAGENTA]: \"background: magenta\",\n    [LogColor.B_CYAN]: \"background: cyan\",\n    [LogColor.B_WHITE]: \"background: white\",\n};\n/**\n * 로그의 색 조합을 정의하는 유틸리티 클래스.\n */\nclass LogStyle {\n}\nexports.LogStyle = LogStyle;\nLogStyle.NORMAL = [LogColor.NORMAL];\nLogStyle.CALLER = [LogColor.F_CYAN];\nLogStyle.CALLER_PID = [LogColor.F_MAGENTA];\nLogStyle.CALLER_FILE = [LogColor.BRIGHT, LogColor.F_CYAN];\nLogStyle.CALLER_LINE = [LogColor.NORMAL];\nLogStyle.LINE = [LogColor.BRIGHT];\nLogStyle.METHOD = [LogColor.F_YELLOW];\nLogStyle.TIMESTAMP = [LogColor.F_BLUE];\nLogStyle.TARGET = [LogColor.BRIGHT, LogColor.F_BLUE];\nLogStyle.TITLE = [LogColor.BRIGHT];\nLogStyle.TYPE_ERROR = [LogColor.BRIGHT, LogColor.B_RED];\nLogStyle.TYPE_INFO = [LogColor.B_BLUE];\nLogStyle.TYPE_NORMAL = [LogColor.BRIGHT];\nLogStyle.TYPE_SUCCESS = [LogColor.F_BLACK, LogColor.B_GREEN];\nLogStyle.TYPE_WARNING = [LogColor.F_BLACK, LogColor.B_YELLOW];\nLogStyle.XHR = [LogColor.F_GREEN];\n\n\n//# sourceURL=webpack://flutter_browser_back/./src/util/logger.ts?");

/***/ }),

/***/ "./src/util/setting.ts":
/*!*****************************!*\
  !*** ./src/util/setting.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.schedule = exports.writeClientConstants = exports.fileInBuild = exports.fileInPublic = exports.SETTINGS = exports.CLOTHES = void 0;\nconst utility_1 = __webpack_require__(/*! ./utility */ \"./src/util/utility.ts\");\nconst fs_1 = __importDefault(__webpack_require__(/*! fs */ \"fs\"));\nconst path_1 = __importDefault(__webpack_require__(/*! path */ \"path\"));\nfunction getBoolean(name) {\n    return process.argv.includes(name);\n}\nexports.CLOTHES = {\n    development: !getBoolean(\"-remote\")\n};\n/**\n * `data/settings.json` 파일 객체.\n */\nexports.SETTINGS = {}\n    = (0, utility_1.merge)({}, exports.CLOTHES.development ? JSON.parse(fileInPublic(\"settings/settings.dev.json\").toString()) : JSON.parse(fileInPublic(\"settings/settings.json\").toString()));\n/**\n * 퍼블릭 폴더의 데이터를 동기식으로 읽어 그 내용을 반환한다.\n *\n * @param file 퍼블릭 폴더에서의 하위 경로.\n */\nfunction fileInPublic(file) {\n    return fs_1.default.readFileSync(path_1.default.resolve(__dirname, \"../public/\" + file));\n}\nexports.fileInPublic = fileInPublic;\nfunction fileInBuild(file) {\n    return fs_1.default.readFileSync(path_1.default.resolve(__dirname, \"./\" + file));\n}\nexports.fileInBuild = fileInBuild;\n/**\n * 외부에서 `/constants.js`로 접속할 수 있는 프런트 설정 파일을 만든다.\n *\n * data/settings.json에 외부에서 접근해서는 안되는 정보가 있기 때문이다.\n * 이 파일에는 `data/settings.json` 파일의 `application` 객체 일부가 들어가 있다.\n */\nfunction writeClientConstants() {\n    const data = JSON.stringify((0, utility_1.pick)(exports.SETTINGS, \"host\", \"board\", \"follow\", \"block\", \"extension\"));\n    fs_1.default.writeFileSync(path_1.default.resolve(__dirname, \"constants.js\"), `window.__CLIENT_SETTINGS=${data}`);\n}\nexports.writeClientConstants = writeClientConstants;\n/**\n * 주어진 함수가 주기적으로 호출되도록 한다.\n *\n * @param callback 매번 호출할 함수.\n * @param interval 호출 주기(㎳).\n * @param options 설정 객체.\n */\nfunction schedule(callback, interval, options) {\n    if (options === null || options === void 0 ? void 0 : options.callAtStart) {\n        callback();\n    }\n    if (options === null || options === void 0 ? void 0 : options.punctual) {\n        const now = Date.now() + utility_1.TIMEZONE_OFFSET;\n        const gap = (1 + Math.floor(now / interval)) * interval - now;\n        global.setTimeout(() => {\n            callback();\n            global.setInterval(callback, interval);\n        }, gap);\n    }\n    else {\n        global.setInterval(callback, interval);\n    }\n}\nexports.schedule = schedule;\n\n\n//# sourceURL=webpack://flutter_browser_back/./src/util/setting.ts?");

/***/ }),

/***/ "./src/util/utility.ts":
/*!*****************************!*\
  !*** ./src/util/utility.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.toSignedString = exports.resolveLanguageArguments = exports.enumToArray = exports.reduceToTable = exports.pick = exports.merge = exports.cut = exports.Iterator = exports.TIMEZONE_OFFSET = exports.REGEXP_LANGUAGE_ARGS = exports.FRONT = exports.CLIENT_SETTINGS = void 0;\nconst unitDate_1 = __webpack_require__(/*! common/unitDate */ \"./src/common/unitDate.ts\");\n/**\n * 클라이언트 설정 객체.\n */\nexports.CLIENT_SETTINGS = \"FRONT\" in Object && eval(\"window.__CLIENT_SETTINGS\"); // template html에서 CLIENT_SETTINGS 가져옴\n/**\n * 프론트엔드 여부.\n */\nexports.FRONT = Boolean(exports.CLIENT_SETTINGS);\n/**\n * 유효한 단일 샤프 인자의 집합.\n */\nexports.REGEXP_LANGUAGE_ARGS = /\\{#(\\d+?)\\}/g;\n/**\n * 시간대 오프셋 값(㎳).\n */\nexports.TIMEZONE_OFFSET = new Date().getTimezoneOffset() * unitDate_1.UnitDate.MINUTE;\n/**\n * 배열을 생성해 반환한다.\n *\n * @param length 배열의 길이.\n * @param fill 배열의 내용.\n */\nfunction Iterator(length, fill) {\n    return Array(length).fill(fill);\n}\nexports.Iterator = Iterator;\n/**\n * 제한 길이를 초과하는 내용이 생략된 문자열을 반환한다.\n *\n * @param text 대상 문자열.\n * @param limit 제한 길이.\n */\nfunction cut(text, limit) {\n    return text.length > limit\n        ? `${text.slice(0, limit - 1)}…`\n        : text;\n}\nexports.cut = cut;\n/**\n * 대상 객체에 합칠 객체들을 모두 합친 객체를 반환한다.\n *\n * 대상 객체는 복사되지 않고 직접 수정되며,\n * 합치려는 값이 객체인 경우 값을 덮어쓰지 않고 이 함수를 재귀적으로 호출한다.\n *\n * @param target 대상 객체.\n * @param args 합칠 객체 목록.\n */\nfunction merge(target, ...args) {\n    for (const v of args) {\n        for (const [k, w] of Object.entries(v)) {\n            if (typeof target[k] === \"object\" && typeof w === \"object\" && w != null) {\n                merge(target[k], w);\n            }\n            else {\n                target[k] = w;\n            }\n        }\n    }\n    return target;\n}\nexports.merge = merge;\n/**\n * 대상 객체의 엔트리 일부만 갖는 객체를 반환한다.\n *\n * @param object 대상 객체.\n * @param keys 선택할 키.\n */\nfunction pick(object, ...keys) {\n    return keys.reduce((pv, v) => {\n        if (v in object) {\n            pv[v] = object[v];\n        }\n        return pv;\n    }, {});\n}\nexports.pick = pick;\n/**\n * 배열을 주어진 함수에 따라 딕셔너리로 바꾸어 반환한다.\n *\n * @param target 대상 배열.\n * @param placer 값을 반환하는 함수.\n * @param keyPlacer 키를 반환하는 함수.\n */\nfunction reduceToTable(target, placer, keyPlacer) {\n    return target.reduce(keyPlacer\n        ? (pv, v, i, my) => {\n            pv[keyPlacer(v, i, my)] = placer(v, i, my);\n            return pv;\n        }\n        : (pv, v, i, my) => {\n            pv[String(v)] = placer(v, i, my);\n            return pv;\n        }, {});\n}\nexports.reduceToTable = reduceToTable;\n/**\n * 열거형의 키 배열을 반환한다.\n * @param target 대상 열거형.\n * @returns 배열.\n */\nfunction enumToArray(target) {\n    return Object.keys(target).filter((i) => isNaN(Number(i)));\n}\nexports.enumToArray = enumToArray;\n/**\n * 문자열 내 단일 샤프 인자들을 추가 정보로 대체시켜 반환한다.\n *\n * @param text 입력 문자열.\n * @param args 추가 정보.\n */\nfunction resolveLanguageArguments(text, ...args) {\n    return text.replace(exports.REGEXP_LANGUAGE_ARGS, (_, v1) => args[v1]);\n}\nexports.resolveLanguageArguments = resolveLanguageArguments;\n/**\n * 주어진 수가 0보다 크면 + 기호를 붙여 반환한다.\n *\n * @param value 대상.\n */\nfunction toSignedString(value) {\n    return (value > 0 ? \"+\" : \"\") + value;\n}\nexports.toSignedString = toSignedString;\n\n\n//# sourceURL=webpack://flutter_browser_back/./src/util/utility.ts?");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/process.ts");
/******/ 	
/******/ })()
;