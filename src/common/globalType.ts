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
      port: number
}