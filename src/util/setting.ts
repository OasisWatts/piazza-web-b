import { merge, pick, TIMEZONE_OFFSET } from "./utility"

import fs from "fs";
import path from "path"


function getBoolean(name: string): boolean {
      return process.argv.includes(name)
}
export const CLOTHES: {
      /**
       * `--dev`
       *
       * 개발 플래그 설정 여부.
       */
      "development"?: boolean
}
      = {
      development: !getBoolean("-remote")
}

/**
 * `data/settings.json` 파일 객체.
 */
export const SETTINGS: Settings = {}
      = merge(
            {},
            CLOTHES.development ? JSON.parse(fileInPublic("settings/settings.dev.json").toString()) : JSON.parse(fileInPublic("settings/settings.json").toString()),
      ) as any

/**
 * 퍼블릭 폴더의 데이터를 동기식으로 읽어 그 내용을 반환한다.
 *
 * @param file 퍼블릭 폴더에서의 하위 경로.
 */
export function fileInPublic(file: string): Buffer {
      return fs.readFileSync(path.resolve(__dirname, "../public/" + file))
}
export function fileInBuild(file: string): Buffer {
      return fs.readFileSync(path.resolve(__dirname, "./" + file))
}
/**
 * 외부에서 `/constants.js`로 접속할 수 있는 프런트 설정 파일을 만든다.
 *
 * data/settings.json에 외부에서 접근해서는 안되는 정보가 있기 때문이다.
 * 이 파일에는 `data/settings.json` 파일의 `application` 객체 일부가 들어가 있다.
 */
export function writeClientConstants(): void {
      const data = JSON.stringify(pick(
            SETTINGS,
            "host",
            "board",
            "follow",
            "block",
            "extension"
      ))
      fs.writeFileSync(
            path.resolve(__dirname, "constants.js"),
            `window.__CLIENT_SETTINGS=${data}`,
      )
}
/**
 * 주어진 함수가 주기적으로 호출되도록 한다.
 *
 * @param callback 매번 호출할 함수.
 * @param interval 호출 주기(㎳).
 * @param options 설정 객체.
 */
export function schedule(
      callback: (...args: any[]) => void,
      interval: number,
      options?: Partial<{
            /**
             * `true`인 경우 시작할 때 한 번 즉시 호출한다.
             */
            "callAtStart": boolean,
            /**
             * `true`인 경우 정시에 호출된다. 가령 1시간마다 호출하려는 경우
             * 시작 시점과는 관계 없이 0시 정각, 1시 정각, …에 맞추어 호출된다.
             */
            "punctual": boolean
      }>,
): void {
      if (options?.callAtStart) {
            callback()
      }
      if (options?.punctual) {
            const now = Date.now() + TIMEZONE_OFFSET
            const gap = (1 + Math.floor(now / interval)) * interval - now

            global.setTimeout(() => {
                  callback()
                  global.setInterval(callback, interval)
            }, gap)
      } else {
            global.setInterval(callback, interval)
      }
}
