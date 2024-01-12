import { Logger } from "./util/logger"
import Process from "child_process"

const { spawn } = Process

const processWeb: Process.ChildProcess = spawn("node", ["./main.js", "-remote"])
if (processWeb) {
      processWeb.stdout?.on("data", (data) => {
            console.log(data.toString())
      })
      processWeb.stderr?.on("data", (data) => {
            console.log(data.toString())
      })
      processWeb.on("exit", (code, signal) => {
            Logger.errorSignificant("Process").put(`web process terminated, exit code: ${code}, signal: ${signal}`).out()
      })
}