$(function($){

	var KEY_SPREADSHEET  = '1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4',	// Spreadsheet Key
		GID_SHEET_REGIST = '132886731',		// 등록부
		GID_SHEET_SUBJECT= '2098472162';	// 개설강의 목록
	var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyOpp8Fl9V5DAd_ZjsDSI12z7oQLOLufI3HfipWxiUMvngxeOIq/exec',	// 출석부에 기록하기 위한 웹 앱
		SHEET_NAME_ATTEND = '출석부';

	// --------------------------------------------------
	// 1-1. 출석체크가 초기 실행되면 개설된 강의 목록을 읽어와야 함
	// 1-2. 로딩이 끝나면 loadingbar fadeout 효과를 
	// --------------------------------------------------
	$.ajax({
		url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_SUBJECT
	}).done(function (data) {
		var list = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
			sum = list.length; // 목록 수.

		var phoneNumber = '';

		//console.log('* SHEET DATA URL - https://docs.google.com/spreadsheets/d/1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4/edit?usp=sharing'); // 구글 스프레드시트 URL.
		console.log('* 전체 강의 수: ' + sum + '개');

		for (var i = 0; i < sum; i++) { // 전체 강의 목록을 콘솔에 출력. 
		    //console.log(i+1 + '  ' + list[i].c[5].v + ' / ' + list[i].c[4].v + ' / ' + list[i].c[6].v);
		    var ipt = '<li><label>';
		    	ipt += '<input type="radio" name="subject" value="' + list[i].c[4].v + '">';
		    	ipt += '[' + list[i].c[1].v + '] ';
		    	if(list[i].c[2] != null) { 
		    		ipt += list[i].c[2].v + '학년 ' + list[i].c[3].v + ' '; 
		    	}
		    	ipt += list[i].c[6].v + ' / ';
		    	ipt += list[i].c[5].v;
		    	ipt += '</label></li>';
		    $('.subject').append( $(ipt) );
		}
		$('.loading-container').fadeOut(); // 로딩바 제거.
	}).fail(function () {
		alert('데이터 불러오기 실패. 아마도 jQuery CDN 또는 일시적인 구글 API 문제.');
	});

	// --------------------------------------------------
	// 2-1. '등록 확인'을 최초로 누르면 등록부 시트로부터 해당하는 등록자를 가져와서
	// 2-2. 기존에 등록된 사람인지 아닌지 표시한다.
	// --------------------------------------------------
	$('#checkIdBtn').click(function(){ // 등록자 검색

		phoneNumber = $('#phone').val();

		// 전화번호 형식 체크 정규식 010-1234-5678
		var regExp = /^\d{3}-\d{3,4}-\d{4}$/;
		if (!regExp.test( phoneNumber )) {
			alert('010-1234-5678 형식에 맞춰서 핸드폰번호를 넣어주세요.');
			$('#phone').focus();
			return false;
		}

		$.ajax({
			url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_REGIST+'&tq=select+*+where+D+matches+\''+phoneNumber+'\''
		}).done(function (data) {
			var students = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
				total = students.length; // 목록 수.
			
			console.log('* 검색된 등록자 수: ' + total + '명');
			
			$('output').show();
			if (total<1) {
				$('output>a').html(phoneNumber + ' 는 아직 등록이 되지 않았습니다.<br>여기를 눌러 "등록"을 먼저해주세요.').attr('href', 'https://goo.gl/forms/asSLANctriVD1fjg1');
			} else if (total>1) {
				alert('동일 아이디 발생! 관리자에게 문의해주시기 바랍니다.');
			} else {
				var msg = students[0].c[1].v;			// name
					msg += ' ' + students[0].c[3].v;	// phone
					msg += ' ' + students[0].c[8].v;	// title (soonjang)
					msg += ' (' + students[0].c[5].v;	// campus
					msg += ' ' + students[0].c[6].v.toString().substr(-2) + '학번)';
					msg += ' ' + students[0].c[4].v.toString().substr(0,1) + '학년';
					msg += '/ 등록비: ' + students[0].c[13].f;
				console.log(msg);
				msg = students[0].c[1].v + ' ';		// name
				msg	+= students[0].c[8].v + '님 ';	// title (soonjang)
				msg += students[0].c[3].v + '<br>';	// phone
				msg += students[0].c[4].v.toString().substr(0,1) + '학년 / ';
				msg += students[0].c[5].v + ' ';	// campu
				msg += students[0].c[6].v.toString().substr(-2) + '학번 / 회비: ';
				msg += students[0].c[13].f + '\n';
				$('output>a').html(msg).removeAttr('href');
				$('input[name="phoneCheck"]').val(students[0].c[3].v.toString().substr(-4));
				$('input[name="studentName"]').val(students[0].c[1].v);
				$('#fee_total').text(students[0].c[13].f);
			}

		}).fail(function(){
			alert('등록자 검색 실패');
		});

	});


	// ==================================================
	// 추가해야할 코드
	// ==================================================
	// 교육기간 및 시간이 아닐 경우 출석을 하지 못하도록 하는 코드 (조건문)
	// ==================================================


	// --------------------------------------------------
	// 3-1. '출석하기' 처리
	// --------------------------------------------------
	// 1) 데이터 유효성 검사
	// 
	// 2) 버튼 비활성화 (중복 등록 방지)
	//
	// 3) 출석부 시트에 등록 (timestamp, phone, subject)
	//    나머지 column은 spreadsheet 안에서 함수로 가져다 쓸 것 (중복데이터 최소화)
	$('#submitBtn').click(function(){

		//$('#submitBtn').prop('disabled', true); // 버튼 비활성화
		$('#submitBtn').attr('disabled', true); // 버튼 비활성화
		$('.loading-container').fadeIn();

		phoneNumber = $('#phone').val();

		if (!phoneNumber) {
			alert('핸드폰번호를 입력하고 "등록 확인" 버튼을 누르세요.');
			$('#submitBtn').removeAttr('disabled') // 버튼 활성화 복귀
			$('#phone').focus();
			return false;
		}

		// 전화번호 형식 체크 정규식 010-1234-5678
		var regExp = /^\d{3}-\d{3,4}-\d{4}$/;
		if (!regExp.test( phoneNumber )) {
			alert('010-1234-5678 형식에 맞춰서 핸드폰번호를 넣어주세요.');
			$('#phone').focus();
			return false;
		}

		var subject_selected = $(':radio[name="subject"]:checked').val();
		if (!subject_selected) {
			alert('수강하는 과목을 선택하세요.');
			$('#submitBtn').removeAttr('disabled'); // 버튼 활성화 복귀
			$('.loading-container').fadeOut();
			return false;
		}

		//console.log('수강과목 선택 확인');
		//console.log(subject_selected);

		if ($('input[name="phoneCheck"]').val() != phoneNumber.substr(-4)) {
			alert('등록하신 게 맞습니까?\n"등록 확인" 버튼을 눌러 진행하거나 "등록"해주세요.');
			$('#submitBtn').removeAttr('disabled'); // 버튼 활성화 복귀
			$('.loading-container').fadeOut();
			$('#phone').focus();
			return false;
		}

		//console.log( $('input[name="phoneCheck"]').val() );
		//console.log( phoneNumber );
		//console.log('핸드폰 입력 확인');

		var fee = $('#fee').val();
		if (fee == '' || fee == null) fee = 0;

		$.ajax({
			url: WEB_APP_URL + '?sheet_name=' + SHEET_NAME_ATTEND,
			data: {
				no: '',
				attendTime: '',
				checker: '',
				phone: phoneNumber,
				subject: subject_selected,
				fee: fee
			}
		}).done(function(data){
			var msg = $('input[name="studentName"]').val() + '/' + $('input[name="phoneCheck"]').val() + '/' + phoneNumber + '/' + subject_selected + '/' + fee;
			console.log(msg);
			alert($('input[name="studentName"]').val()+'님 출석이 되었습니다.');

			$('#submitBtn').removeAttr('disabled');
			$('#phone').val('');
			$('#fee').val('');
			$('input[name="phoneCheck"]').val('');
			$('output>a').text('');
			$('output').hide();
			$('input:radio[name="subject"]').prop('checked', false);
			$('body').scrollTop(0);	// 페이지 맨 위로 이동
			$('.loading-container').fadeOut();
		}).fail(function(){
			alert('출석을 기록하는데 에러가 발생했습니다.');
			$('#submitBtn').removeAttr('disabled'); // 버튼 활성화 복귀
		});
	}); 
});
