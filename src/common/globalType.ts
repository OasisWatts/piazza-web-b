declare type Settings = {
      host: string
      "language-support": object
      database: {
            host: string,
            port: number,
            username: string,
            password: string,
            database: string
      }
      log: {
            interval: number
            directory: string
      }
      https: {
            key: string
            ca: string
            cert: string
      }
      port: number
}