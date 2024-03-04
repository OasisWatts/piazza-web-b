# Brownie backend


### deploy with docker
- build image ( 이 폴더의 Dockerfile을 이용해, brownie-back 이라는 이름의 image를 생성 또는 갱신 )
``` docker build -t brownie-back . ```  
- connect to mysql ( 이 image를 사용해, mysql container와 네트워크가 연결된 container 생성 ) { container간 네트워크는 기본적으로 존재하지 않는다. 생성 설정이 필요한 것 } 
``` cd /home/docker/mysql && docker-compose up -d  ```  
- docker에 잘 올라와 있나 확인
``` docker container ps -a ```
- docker 네트워크 잘 연결되어있나 확인
``` docker network inspect mysql_node_net ```
- container로 실행되는 프로세스를 bash창에서 명령
``` docker exec -it {container name} bash ```


### prepare for deploy
- settings.json configuration 확인
- app(social_media_browser) 소스 코드(util.ts)에서도 configuration이 일치하는지 확인
