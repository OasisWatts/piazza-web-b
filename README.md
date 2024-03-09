# Brownie backend
</br>

---
## deploy api with docker
``` sudo ./deploy.sh ```  
- nodejs service만 시간을 들이고 두 개 각각 재생성 (down time을 최소화하기 위함)
#### 설명
- build image (이 폴더의 Dockerfile을 이용, docker-compose.yml에 root directory가 설정되어 있음)
``` docker-compose build nodejs1 nodejs2 ```  
- container 생성 (imgae를 기반으로, mysql, node, nginx container 생성)
</br> mysql에 변동이 없다면 재생성하지 않으나, 변동이 있을 경우 재생성할 수 있고 디비  날라감(첫 세팅아니면 사용 지양)
</br> deploy.sh는 nodejs만 재생성하고 있음
``` docker-compose up --no-deps nodejs1 -d```  
``` docker-compose up --no-deps nodejs2 -d```  

#### 잘 작동이 안 될 때
- docker에 잘 올라와 있나 확인
``` docker container ps -a ```
- docker 네트워크 잘 연결되어있나 확인
``` docker network inspect mysql_node_net ```
- container로 실행되는 프로세스를 bash창에서 명령
``` docker exec -it {container name} bash ```
- mysql 관련 오류가 발생 시, mysql bash 입장
``` docker exec -it mysql bash ```
- image를 이름을 지어서 생성
``` docker build -t {image name} . ```  
---

## deploy website
``` cd /home/docker/brownie-web-fe && npm run install && npm run build  ```
#### 설명
- 해당 위치가 nginx container에 volume으로 mount되어 있음(docker-compose.yml 참고)
- build 파일만 최신으로 바꿔주면 됨 (따로 옮기거나, nginx을 껐다 키거나 작업 필요 없음)


---

## deploy checklist
- settings.json configuration 확인
- app(social_media_browser) 소스 코드(util.ts)에서도 configuration이 일치하는지 확인
- ssl certificates 종료 기한 확인. 종료 기한을 nginx_proxy_manager(172.233.129.121:81)에서 확인하고, ssl 인증서 갱신
- 모든 container가 잘 돌아가는지 확인. portainer(172.233.129.121:9000) 또는 docker container ps -a 명령어로 확인

---

## 만약에..
#### nginx를 변경할 일이 생겼다
- nginx.conf 변경
- docker restart nginx (docker exec nginx nginx -s reload가 안통함)
#### node 서버에서 typeorm synchronize:true로 인한 문제가 생겼다
- 한 서버는 잘 돌아가고, 나머지 서버에서 오류가 났을 것
- docker restart {container name}
---
## 주의
#### mysql db 조심히 다루기
- docker-compose.yml의 db: volumes, container name 변경 금지 (다른 것도 건들지 말기)
---

## 세팅
- 주 사용 directory: /home/docker/
- webrownie node source code directory: /home/docker/brownie-back
- 가동 방식: 두 개의 webrownie backend node server가 nginx로 로드 밸런싱되며, mysql이 별개의 container로 돌아가고 있음. 두 개의 webrownie backend node server 각각이 한 mysql과 통신
#### mysql backup
- backup sql file directory: /home/mysql_backup/sql
- backup bash file: /home/mysql_backup/backup.sh
- backup 정책: 1시간 마다, 5일치 저장
- 참고 file: /etc/crontab

#### ssl certificate
- 생성할 때, nginx_proxy_manager 이용
- 갱신 방법: 172.233.129.121:81에 접속해, ssl certificated 갱신

#### log
- docker가 container 당 자동 생성
- log directory: /var/lib/docker/containers/{container ID}/
- 쉬운 조회: portainer(172.233.129.121:9000)에서 각 container을 선택해 로그를 확인 가능
- logrotate 정책: 1파일 당 하루분, 최대 30개 파일을 압축파일 형태로 저장
- logrotate 설정 file: /etc/logrotate.d/docker 
- logrotate 실행했던 명령어: sudo logrotate -fv /etc/logrotate.d/docker
