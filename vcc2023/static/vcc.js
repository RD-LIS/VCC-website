function hello()  {

    alert('1차 300명 마감되었습니다. 추가 좌석 필요하신분은 하단 문의하기를 통해 연락주시기 바랍니다.');

  }

  const newYears='27 July 2023'

  function countdown() {
      const newYearsDate = new Date(newYears);
      const currentDate = new Date();
  
      const totalSeconds = (newYearsDate - currentDate) / 1000;
      const days = Math.floor(totalSeconds / 3600 / 24);
      const hours = Math.floor(totalSeconds / 3600 ) % 24;
      const minutes = Math.floor(totalSeconds / 60) % 60;
      const seconds = Math.floor(totalSeconds) % 60;
  
      document.getElementById('days').innerText = formatTime(days);
      document.getElementById('hours').innerText = formatTime(hours);
      document.getElementById('minutes').innerText = formatTime(minutes);
      document.getElementById('seconds').innerText = formatTime(seconds);
  }
  function formatTime(time) {
      return time < 10 ? '0' + time : time;
  }
  
  //setInterval(countdown, 1000);
  // 카운트다운 끔.


  // 현재 날짜와 시간을 가져오는 함수
function getCurrentDateTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();
    return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
  }
  
  // 일정 간격으로 날짜와 시간 체크 함수 호출
  //setInterval(checkAccess, 1000); // 1초마다 체크
  // 해당 함수 없어짐. 어디에 쓰던건지 모르겠음.