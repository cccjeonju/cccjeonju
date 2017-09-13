jQuery(function($){

	var KEY_SPREADSHEET = "1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4",
		GID_SHEET_ATTEND = "1980648270",
		GID_SHEET_REGIST = "1095637889",
		GID_SHEET_SUBJECT= "2098472162"
	// --------------------------------------------------
	// 1. 초기 실행되면 loadingbar 효과를 주며 페이지 로딩 (수강과목 로딩까지 끝냄)
	// --------------------------------------------------
	$.ajax({
		url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_SUBJECT
	}).done(function (data) {
		var list = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
			sum = list.length; // 목록 수.
		//console.log('* SHEET DATA URL - https://goo.gl/Vvge1E'); // 구글 스프레드시트 URL.
		console.log('* 전체 강의 수: ' + sum + '개');
		for (var i = 0; i < sum; i++) { // 전체 강의 목록을 콘솔에 출력. 
		    console.log(i+1 + '  ' + list[i].c[5].v + ' / ' + list[i].c[4].v + ' / ' + list[i].c[6].v);
		    //$('#subject').append( $('<option value="' + list[i].c[4].v.toString() + '">[' + list[i].c[1].v.toString() + '] ' + list[i].c[6].v.toString() + ' / ' + list[i].c[5].v.toString() + '</option>') );
		    $('.subject').append( $('<li><label><input type="radio" name="subject" value="' + list[i].c[4].v.toString() + '">[' + list[i].c[1].v.toString() + '] ' + list[i].c[6].v.toString() + ' / ' + list[i].c[5].v.toString() + '</label></li>') );
		}
		$('.loading-container').fadeOut(); // 로딩바 제거.

		// --------------------------------------------------
		// 2-1. '등록 확인'을 최초로 누르면 등록부 시트로부터 등록자 명단을 가져온다. 
		// 2-2. 가져온 명단을 전역변수로 가지고 있으면서 등록자인지 체크하여 화면에 표시한다.
		// --------------------------------------------------
		var checkID = function() { // 등록자 검색
			//var num = parseInt(Math.random()*sum); // 난수 생성.

			// 전화번호 형식 체크 정규식 010-1234-5678
			var regExp = /^\d{3}-\d{3,4}-\d{4}$/;
			if (!regExp.test( $('#phone').val() )) {
				alert('010-1234-5678 형식에 맞춰서 핸드폰번호를 넣어주세요.');
				$('#phone').focus();
				return false;
			}

			$.ajax({
				url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_REGIST
			}).done(function (data) {
				var students = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
					total = students.length; // 목록 수.
				console.log('* 전체 등록자 수: ' + total + '명');
				console.log('* PHONE = ' + $('#phone').val());
				for (var i = 0; i < total; i++) {
					console.log(i+1 + ' ' + students[i].c[3].v + ' ' + students[i].c[1].v + ' ' + students[i].c[8].v + '님 (' + students[i].c[5].v + ' ' + students[i].c[6].v.toString().substr(-2) + '학번)');
					$('output').attr('style', 'display:block');
					if (students[i].c[3].v == $('#phone').val()) {
						$('output>a').html(students[i].c[1].v + '<br>' + students[i].c[1].v + ' ' + students[i].c[8].v + '님 (' + students[i].c[5].v + ' ' + students[i].c[6].v.toString().substr(-2) + '학번)\n');
						return;
					}
				}
				$('output>a').html($('#phone').val() + ' 는 아직 등록이 되지 않았습니다.<br>여기를 눌러 \'등록\'을 먼저해주세요.').attr('href', 'https://goo.gl/ZFfX76');
			}).fail(function(){
				alert('등록자 검색 실패');
			});
		};
		
		// 교육기간 및 시간이 아닐 경우 출석을 하지 못하도록 하는 코드 (조건문)
		// 정규식이 맞지 않으면 조회하지 않음
		$('#checkIdBtn').on('click', checkID); // '등록 확인'' 체크

		// --------------------------------------------------
		// 3-1. '출석하기' 처리
		// --------------------------------------------------
		// 1) 데이터 유효성 검사
		// 
		// 2) 버튼 비활성화 (중복 등록 방지)
		//
		// 3) 출석부 시트에 등록 (timestamp, phone, subject)
		//    나머지 column은 spreadsheet 안에서 함수로 가져다 쓸 것 (중복데이터 최소화)

		var submitAttend = function() {
			$('#submitBtn').prop('disabled', true); // 버튼 비활성화

			if( !$('#phone').val() ) {
				alert('핸드폰번호를 입력하고 \'등록 확인\' 버튼을 누르세요.');
				$('#phone').focus();
				return false;
			}

			console.log('핸드폰 입력 확인');

			var subject_selected = $(':radio[name="subject"]:checked').val();
			if( !subject_selected ) {
				alert('수강하는 과목을 선택하세요.');
				return false;
			}

			console.log('수강과목 선택 확인');

			$.ajax({
				url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_ATTEND,
				data: {
					phone: $('#phone').val(),
					subject: subject_selected
				},
				type: "POST"
			}).done(function(data){
				console.log(data);
				alert('출석이 되었습니다.');
				$('#submitBtn').prop('disabled', false);
				$('#phone').empty();
				$('input:radio[name="subject"]').prop('checked', false);
			}).fail(function(){
				alert('출석을 기록하는데 에러가 발생했습니다.');
			});
		};

		$('#submitBtn').on('click', submitAttend); 

		// --------------------------------------------------
		// 추가 작업 지시서
		// --------------------------------------------------
		// 1. 회비 납부
		// 2. 출석 확인 (강사용)
		// --------------------------------------------------

	}).fail(function () {
		alert('데이터 불러오기 실패. 아마도 jQuery CDN 또는 일시적인 구글 API 문제.');
	});
});
