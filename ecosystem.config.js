module.exports = {
    apps: [{
        name: 'brownie', // reload 할 때 이름으로 설명
        script: './build/main.js', // 본 파일 실행
        instances: 0, // CPU core 수만큼 실행
        exec_mode: "cluster",
        wait_ready: true,
        listen_timeout: 5000,
        kill_timeout: 5000
    }]
}