jQuery(function($){
	$.ajax({
		url: 'https://docs.google.com/spreadsheets/d/1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4/gviz/tq'
	}).done(function (data) {
		var list = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
		sum = list.length; // 목록 수.
		//console.log('* SHEET DATA URL - https://goo.gl/Vvge1E'); // 구글 스프레드시트 URL.
		//console.log(data);
		//console.log(list);
		//console.log('* 전체 등록 수: ' + sum + '명');
		for (var i = 0; i < sum; i++) { // 전체 식당 목록을 콘솔에 출력. 
		    console.log(i+1 + '  ' + list[i].c[1].v + ' / ' + list[i].c[2].v + ' / ' + list[i].c[3].v);
		    //$('output>a').text(i+1 + '. ' + list[i].c[1].v + ' - ' + list[i].c[2].v + ' ' + list[i].c[3].v);
		}
		$('.loading-container').fadeOut(); // 로딩바 제거.

		var checkID = function(){ // 등록자 검색
			//var num = parseInt(Math.random()*sum); // 난수 생성.

			// 전화번호 형식 체크 정규식 010-1234-5678
			var regExp = /^d{2,3}-\d{3,4}-\d{4}$/;
			
			if (!regExp.test( $('#phone').val() )) {
				alert("010-1234-5678 형식에 맞춰서 핸드폰번호를 넣어주세요.");
				$('#phone').focus();
				return false;
			}

			for (var i = 0; i < sum; i++) {
				//console.log($('#phone').val());
				$('output').attr('style', 'display:block');
				if (list[i].c[3].v == $('#phone').val()) {
					$('output>a').text(list[i].c[1].v + ' ' + list[i].c[8].v + '님 (' + list[i].c[5].v + ' ' + list[i].c[6].v.toString().substr(-2) + '학번)');
					return;
				}
			}
			$('output>a').text('아직 등록이 되지 않았습니다.<br>여기를 눌러 \'등록\'을 먼저해주세요.').attr('href', 'https://goo.gl/ZFfX76');
			//$('output>a').text(list[num].c[1].v).attr('href', list[num].c[2].v); // 식당 출력하고 링크 걸기.
		};
		
		// 교육기간 및 시간이 아닐 경우 출석을 하지 못하도록 하는 코드 (조건문)
		// 정규식이 맞지 않으면 조회하지 않음
		$('#checkIdBtn').on('click', checkID); // '등록 확인'' 체크

		// 출석하기 함수
		//
		//
		//
		//


	}).fail(function () {
		alert('아이쿠! 데이터 불러오기 실패. 아마도 jQuery CDN 또는 일시적인 구글 API 문제. ㅜㅜ;');
	});
});
