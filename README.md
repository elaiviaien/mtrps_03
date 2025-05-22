# Методології та технології розробки програмного забезпечення

# Лабораторна робота 3

### Метадані

| Тема | Контейнеризація                                        |
| ---- | ------------------------------------------------------ |
| Мета | Дослідити способи упаковки застосунку у Docker образи. |

## Python

Build image:
```bash
docker build -t python-fastapi-demo .
```
Run container:
```bash
docker run -d -p 8000:8000 python-fastapi-demo
```
### Базовий Dockerfile
[mtrps\_03/python/Dockerfile · GitHub](https://github.com/elaiviaien/mtrps_03/blob/9228540714e398e5d07c0063a93b6c05c455d43c/python/Dockerfile)
Ми можемо побачити час збірки на першому рядку у терміналі після команди, яку написали, коли збірка буде завершена

>`[+] Building 131.8s (14/14) FINISHED`

Щоб побачити розмір імеджу - запускаємо команду і шукаємо створений імедж
```bash
docker images
```

>`python-fastapi-demo          latest              51d0d24b5a8a   About a minute ago   1.12GB`

Тобто з цим варіантом Dockerfile збірка займає 131 секунду, а імедж має розмір 1.12Гб

### Перезбірка і stages

Якщо змінимо `build/index.html` додавши рядок
>`<li><a href='openapi.json'>OpenAPI schema</a></li>`

і запустимо команду збірки - побачимо, що час дуже сильно зменшився

>`[+] Building 1.4s (14/14) FINISHED   `

Це через те, що докер закешував останню збірку і тепер немає потреби запускати усі кроки заново

А розмір не змінився
 >`python-fastapi-demo          latest              4422f9781b43   4 minutes ago   1.12GB`

Даний докерфайл вже непогано використовує можливості кешування, використовуючи шари, що ми бачимо по результатам

---
[mtrps\_03/python/Dockerfile · GitHub](https://github.com/elaiviaien/mtrps_03/blob/4d45f913f8372d3d9c99d3bb795ddceebc425874/python/Dockerfile)
Також можемо переписати `dockerfile` для використання stages
 >`[+] Building 168.1s (16/16) FINISHED`
 
 >`python-fastapi-demo          latest              55d0b4c4d6b5   3 minutes ago   930MB`
 
Якщо перезбирати:
 >`[+] Building 7.2s (16/16) FINISHED     `
 
 >`python-fastapi-demo          latest              c20b9069dcfc   34 seconds ago   930MB`

#### Порівняння обох підходів до Docker-контейнеризації
##### Одноетапний підхід - переваги

- **Простота** - зрозуміло що і коли відбувається без стрибків між етапами
- **Швидша початкова збірка** - весь процес йде одним потоком без необхідності копіювати артефакти між етапами
- **Розробницьке зручності** - легше заходити в контейнер і мати усі інструменти розробника під рукою

##### Багатоетапний підхід (stages) - переваги

- **Менший розмір кінцевого імеджу** - замість повних ~1.12GB можна отримуємо 930Мб
- **Краща безпека** - фінальний імедж не містить інструментів збірки, git-клієнта та інших потенційно вразливих компонентів
- **Чистіше середовище виконання** - запускається тільки те, що справді потрібно для роботи програми
##### Кешування
Обидва підходи досить добре використовують кешування в Docker, якщо правильно структуровані.

У багатоетапному підході кешування більш ефективне і набагато краще підходить для продакшену, де код змінюється часто, залежності рідко, а ci/cd регулярно

Основною відмінністю можна відзначити що для стейджів довша перша збірка, але менший розмір імеджу
### Експеримент з неправильним порядком команд у Dockerfile
[mtrps\_03/python/Dockerfile · GitHub](https://github.com/elaiviaien/mtrps_03/blob/6a1b224203b8421ba3e64686a2f2cced361d2794/python/Dockerfile)
Якщо ми поміняємо місцями команди копіювання коду і встановлення залежностей - це зруйнує кешування, бо при кожній зміні коду треба буде заново встановлювати залежності

**Перша збірка**: 
>`[+] Building 149.2s (14/14) FINISHED `

>`python-fastapi-demo          latest              74e0edba35dd   22 seconds ago   1.12GB`

**Повторна збірка зі зміною файла**
>`[+] Building 99.1s (14/14) FINISHED`

>`python-fastapi-demo          latest              6a05ed22fe42   34 seconds ago   1.12GB`

Тобто для ефективного використання шарів варто спочатку писати шари, які зменшуються найменш часто

### Менший базовий образ
[mtrps\_03/python/Dockerfile · GitHub](https://github.com/elaiviaien/mtrps_03/blob/d35003fd1f0ba8a896514651f0bdf2a7ba9d6908/python/Dockerfile)
Якщо поєднати stages і менший базовий образ(`alpine` замість `buster`), то можна досягти меншого розміру і швидшої збірки імеджу

>`[+] Building 56.2s (16/16) FINISHED`

>`python-fastapi-demo          latest              ab56f0f57bf8   21 seconds ago   86.5MB`

### Додаємо numpy
[mtrps\_03/python/Dockerfile · GitHub](https://github.com/elaiviaien/mtrps_03/blob/0d550cdc460e3876da48c90e490df37e42266268/python/Dockerfile)
Повторна збірка на `alpine` і stages:
>`[+] Building 23.2s (16/16) FINISHED `

>`python-fastapi-demo          latest              bbdd32bd8cff   23 seconds ago   150MB`

Збірка на `debian`(`-slim`)
>`[+] Building 61.9s (16/16) FINISHED `

>`python-fastapi-demo          latest              c78e764f17e0   16 seconds ago   224MB`

Збірка на `Dockerfile` без stages:
[mtrps\_03/python/Dockerfile · GitHub](https://github.com/elaiviaien/mtrps_03/blob/eaf8b9b16bba9310432a43ba57fc73e459ce7ac2/python/Dockerfile)
Alpine:
>`[+] Building 58.3s (14/14) FINISHED`

>`python-fastapi-demo          latest              05e0f03a2b0c   5 seconds ago    348MB`

Slim:
>`[+] Building 90.1s (14/14) FINISHED`

>`python-fastapi-demo          latest              3afd8866dee0   26 seconds ago   494MB`

Неофіційно `numpy` не підтримує Alpine без складного складання. Може вимагати багато додаткових бібліотек, що збільшує час збірки і розмір імеджу
Через це розмір імеджу alpine не так сильно відрізняється ефективністю у даній ситуації ніж slim(debian)

Також, тут ще краще бачимо результат, якого можна досягти за допомогою stages: образи виходять практично у два рази меншими завдяки тому, що dev залежності не потравляють у фінальний імедж 

## Golang

Build image:
```bash
docker build -t golang-fastapi-demo .
```
Run container:
```bash
docker run -d -p 8080:8080 golang-fastapi-demo serve
```

Базовий Dockerfile
[mtrps\_03/golang/Dockerfile · elaiviaien/mtrps\_03 · GitHub](https://github.com/elaiviaien/mtrps_03/blob/270ed061c6763ddb397ac9d2ba520b816a76f602/golang/Dockerfile)

>`[+] Building 51.0s (11/11) FINISHED  `

>`golang-fastapi-demo          latest              a2857fdd00f4   21 seconds ago   339MB`

Якщо перевірити зміст - побачимо що є багато зайвих файлів

>Dockerfile  README.rst  cmd         fizzbuzz    go.mod      go.sum      lib         main.go     templates

### **Робимо багатоетапну збірку із scratch**
[mtrps\_03/golang/Dockerfile · GitHub](https://github.com/elaiviaien/mtrps_03/blob/3e9dcc029d20db7b5fa3c999aa7d28ef31f1188f/golang/Dockerfile)

>`[+] Building 44.3s (10/10) FINISHED`

>`golang-fastapi-demo          latest              0595c5c0a36d   About a minute ago   10.2MB`

Якщо перевіримо сервер - то все працює, отже файлів достатньо для запуску проєкту

**Зручність використання:**
Немає шелу, ні навіть `ls` → важко діагностувати і налаштовувати всередині контейнера, виправляти баги

### **Робимо багатоетапну збірку із distroless**
[mtrps\_03/golang/Dockerfile · GitHub](https://github.com/elaiviaien/mtrps_03/blob/5695076/golang/Dockerfile)

>`[+] Building 46.6s (13/13) FINISHED`

>`golang-fastapi-demo          latest              8e90a2799c41   22 seconds ago      31.9MB`

Перевіряємо вміст 
```bash
docker run --entrypoint=sh -ti golang-fastapi-demo
```
>bin        boot       busybox    dev        etc        fizzbuzz   home       lib        lib64      proc       root       run        sbin       sys        templates  tmp        usr        var

Бачимо, що імедж має більший розмір ніж scratch, але всеодно дуже малий. Але при цьому distroless набагато зручніший для розробки


## Node.js

[mtrps\_03/node/Dockerfile · GitHub](https://github.com/elaiviaien/mtrps_03/blob/2612cb948e324f311b573bbc3f2c2d18e56995a7/node/Dockerfile)
[mtrps\_03/node/docker-compose.yaml · GitHub](https://github.com/elaiviaien/mtrps_03/blob/2612cb948e324f311b573bbc3f2c2d18e56995a7/node/docker-compose.yaml)

Ця команда запустить http сервер на http://localhost:3000/
```bash
docker compose up --build 
``` 


>`[+] Building 26.0s (11/11) FINISHED`

Білд доволі швидкий, але багато часу зайняв пулл імеджу монго
В результаті наш проект використовує два імеджі
>`node-app                     latest              d9076434ccd5   2 minutes ago    224MB`
>`mongo                        6                   798c9b5c82b5   3 weeks ago      747MB`


Тут ми використаємо файл `.dockerignore`, який є способом ігнорувати зазначені файли при зборі імеджу. [mtrps\_03/node/.dockerignore · GitHub](https://github.com/elaiviaien/mtrps_03/blob/2612cb948e324f311b573bbc3f2c2d18e56995a7/node/.dockerignore)

Також використовуємо `docker-compose.yaml` для зручного запуску нашого застосунку з усіма налаштуваннями в одному місці. Вся конфігурація в одному файлі, не требадовгі `docker run ...`, також легко підняти кілька реплік (`docker compose up --scale app=3`),  можна легко додати інші сервіси (у нашому випадку Монго) у ту саму мережу тільки дописавши у `services:`

Для того, щоб монго зберігала дані між перезапусками - ми замаунтили вольюм у докер компоузі. 
```yaml 
mongo:  
  image: mongo:6  
  volumes:  
    - mongo-data:/data/db
```
#### Максимально мінімізуємо розмір імеджу
[mtrps\_03/node/Dockerfile · GitHub](https://github.com/elaiviaien/mtrps_03/blob/40175b5/node/Dockerfile)
Використовуючи stages і distroless ми намагаємося максимально зменшини імедж нашого проєкту. 
Монго вже запулена локально, тож команда докер компоуз запускає проект набагато швидше ніж вперший раз, хоча досі білдиться імедж самого застосунку

У першій версії докерфайлу ми вокристовували `ENTPRYPOINT ["npm", "start"]`, але у distroless немає npm, тож треба по іншому запускати сервер: `CMD ["app.js"]`

>`[+] Building 34.3s (16/16) FINISHED`

>`node-app                     latest              ceea0abeaf1f   About a minute ago   133MB`

Як бачимо, тут розмір імеджу не настільки вражаючи менший, як це було у випадку з Golang. 

## Висновки

Отже, підсумовуючи весь експеримент із трьома технологіями, можна виділити кілька ключових моментів.

По-перше, розмір образу і час його побудови сильно залежать від вибору базового образу й від того, чи використовуються багатоетапні збірки. У випадку з Python-FastAPI ми бачили, що одноетапний образ на buster важив понад 1 ГБ і будувався близько двох хвилин, тоді як Alpine + stages із мінімальним набором залежностей скоротив вагу до ~86 МБ і час збірки до ~56 с. Додавання numpy в Alpine через stages збільшило образ до 150 МБ, але це все одно менше за Debian-slim із numpy (224 МБ). Без stages Alpine-образ із numpy ріс до ~348 МБ, а Debian-slim до ~494 МБ — тобто без етапів видалення dev-пакунків та кешів ефект мінімізації значно знижується.

По-друге, у Go-проекті за допомогою одноетапного Dockerfile образ важив ~339 МБ, залишаючи в собі вихідні файли, модулі та інструменти. Перехід на multi-stage + scratch дав величезний ефект — зниження до ~10 МБ без шелу й утиліт. Distroless прибрав ще трохи додаткових шарів, але підняв вагу до ~32 МБ за рахунок підключення glibc. У Go-світі статично скомпільований бінарник дає майже голий образ, але trade-off — відсутність можливості зайти всередину для налагодження.

По-третє, у Node.js-застосунку навіть slim-образ початково важив близько 224 МБ (без mongo), а в distroless + stages вийшло 133 МБ — зменшення є, але не драматичне. Вага залежить від самого рантайму Node.js і масиву залежностей у node_modules. MongoDB як супутній сервіс додає ще ~747 МБ при першому pull, тому в комплексному середовищі саме образи БД можуть стати вузьким місцем з точки зору займаного дискового простору і часу завантаження. Також для локальної розробки можна розглянути легші варіанти для БД або зовнішні сервіси.

Вирішуючи, який підхід обрати, варто зважати на вимоги: якщо критично зменшити фасад і знизити attack surface — distroless/scratch + multi-stage; якщо потрібна швидка ітерація та можливість заходити в контейнер для debug — slim або alpine без надмірної мінімізації. Таким чином, кожна технологія демонструє свої сильні і слабкі сторони, а універсального рішення не існує — потрібно балансувати між розміром, безпекою та зручністю розробки.
