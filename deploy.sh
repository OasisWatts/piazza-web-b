docker-compose up --no-deps --force-recreate -d nodejs1
printf "Wait for 100 seconds please. Don't turn off.\n"
#sleep 100
docker-compose up --no-deps --force-recreate -d nodejs2
