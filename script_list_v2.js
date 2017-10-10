$(function(){

	var KEY_SPREADSHEET = '1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4',	// Spreadsheet Key
		GID_SHEET_REGIST = '132886731',			// 등록부
		GID_SHEET_ATTEND = '1980648270',		// 출석부
		GID_SHEET_SUBJECT= '2098472162';		// 개설강의 목록
	var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyOpp8Fl9V5DAd_ZjsDSI12z7oQLOLufI3HfipWxiUMvngxeOIq/exec',	// 출석부에 기록하기 위한 웹 앱
		SHEET_NAME_CONFIRM = '출석부';

	var admin_email = 'cccjeonju@gmail.com',
		manage_email = 'hiyen2001@gmail.com';

	var attendee_list = new Array();	// 등록자 정보 - 전체

	var checkerList = new Array();

	// --------------------------------------------------
	// 1-1. 출석체크가 초기 실행되면 개설된 강의 목록을 읽어와야 함
	// --------------------------------------------------
	$.ajax({
		//url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_SUBJECT
		url: 'test/json_subject_list.txt'
	}).done(function (data) {
		var subject_list = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
			sum = subject_list.length; // 목록 수.

		//console.log('* SHEET DATA URL - https://docs.google.com/spreadsheets/d/1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4/edit?usp=sharing'); // 구글 스프레드시트 URL.
		console.log('* 전체 강의 수: ' + sum + '개');

		for (var i = 0; i < sum; i++) { // 전체 강의 목록을 콘솔에 출력. 
			// subject_list[].c[1] = 필수/선택
			//				 .c[2] = 학년
			//				 .c[3] = 필수영역 (G/D/I)
			//				 .c[4] = 강의코드
			//				 .c[5] = 강의명
			//				 .c[6] = 강의자명
			//				 .c[7] = 강의자 email
			//				 .c[8] = 보조자 email
		    //console.log(i+1 + '  ' + subject_list[i].c[5].v + ' / ' + subject_list[i].c[4].v + ' / ' + subject_list[i].c[6].v);
		    var opt = '<option value="' + subject_list[i].c[4].v + '">';
		    	opt += '[' + subject_list[i].c[1].v + '] '
		    if( subject_list[i].c[2] != null ) {
		    	opt += subject_list[i].c[2].v + ' ' + subject_list[i].c[3].v + ' ';
		    }
		    opt += subject_list[i].c[6].v + ' / ' + subject_list[i].c[5].v + '</option>\n';
		    $('#subjectCode').append( $(opt) );

		    checkerList[i] = new Object();
		    checkerList[i].code = subject_list[i].c[4].v;
		    checkerList[i].name = subject_list[i].c[6].v;
		    if(subject_list[i].c[7] != null) checkerList[i].email= subject_list[i].c[7].v;
		    if(subject_list[i].c[8] != null) checkerList[i].assist = subject_list[i].c[8].v;
		}
	}).fail(function () {
		alert('1. 데이터 불러오기 실패. 아마도 jQuery CDN 또는 일시적인 구글 API 문제.');
	});

	// --------------------------------------------------
	// 1-2. 전체 등록부를 읽어옴
	// 1-3. 로딩이 끝나면 loadingbar fadeout
	// --------------------------------------------------

	var attendee_name = {},
		attendee_sex = {},
		attendee_grade = {},
		attendee_campus = {},
		attendee_year = {},
		attendee_register = {},
		attendee_title = {},
		attendee_apply = {},
		attendee_fee = {};

	$.ajax({
		//url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_REGIST
		url: 'test/json_regist_list.txt'
	}).done(function (data) {
			attendee_list = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
			sum = attendee_list.length;

		console.log('* 전체 등록자 수: ' + sum + '개');

		// phone number를 index로 사용하도록 배열 정보 업데이트
			// attendee[].c[0] = timestamp _____(f값)
			//			1] = name (student's)
			//			2] = sex
			//			3] = phone
			//			4] = grade
			//			5] = campus name
			//			6] = starting year _____(f값)
			//			7] = register
			//			8] = title (soonjang)
			//			9] = 11/9 subject, [10]=11/16, [11]=11/23
			//			12]= application
			//			13]= total fee _____(f값)

		for(var i=0; i<sum; i++) {
			attendee_name[attendee_list[i].c[3].v] = attendee_list[i].c[1].v;
			attendee_sex[attendee_list[i].c[3].v]  = attendee_list[i].c[2].v;
			attendee_grade[attendee_list[i].c[3].v]= attendee_list[i].c[4].v;
			attendee_campus[attendee_list[i].c[3].v]=attendee_list[i].c[5].v;
			attendee_year[attendee_list[i].c[3].v] = attendee_list[i].c[6].f;
			attendee_register[attendee_list[i].c[3].v]=attendee_list[i].c[7].v;
			attendee_title[attendee_list[i].c[3].v]= attendee_list[i].c[8].v;
			attendee_apply[attendee_list[i].c[3].v]= attendee_list[i].c[12].v;
			attendee_fee[attendee_list[i].c[3].v]  = attendee_list[i].c[13].f;
		}

		// 로딩바 제거
		$('.loading-container').fadeOut(); // 로딩바 제거.

	}).fail(function () {
		alert('2. 데이터 불러오기 실패. 아마도 jQuery CDN 또는 일시적인 구글 API 문제.');
	});

	// --------------------------------------------------
	// 2-1. 과목을 선택했을 때 - 출석부 시트에서 오늘(특정) 날짜가 있고, 선택된 과목의 레코드들을 읽어옴
	// --------------------------------------------------
	var changeSubject = function() { // 과목 바꾸면 리스트 갱신

		$('.loading-container').fadeIn();
		$('#stTable').empty(); // 명단을 초기화해서 모두 지움

		var subject_code = $('#subjectCode option:selected').val();
		var index = $('#subjectCode option').index($('#subjectCode option:selected'))-1;
		var ii = 0; // 현재 반의 인원
		var feeTotal = 0;

		var today;

		// 관리자일 경우 날짜를 조정할 수 있도록 함
		if ($('#email').val() == manage_email || $('#email').val() == admin_email ) {
			today = $('#now_date').val();
			$('#now_date').removeAttr('readonly');
			$('#up_date').css('display','inline-block');
		} else {
			$('#now_date').prop('readonly',true);
			$('#up_date').hide();
			var now = new Date();
			var year= now.getFullYear();
			var mon = (now.getMonth()+1)>9 ? ''+(now.getMonth()+1) : '0'+(now.getMonth()+1);
			var day = now.getDate()>9 ? ''+now.getDate() : '0'+now.getDate();
				today = year + '-' + mon + '-' + day;
		}
		//console.log('today: ' + today);

		$.ajax({
			type: 'GET',
			// 선택한 과목 중 오늘 날짜에 해당하는 레코드를 가져옴. C column(phone)로 정렬해서
			//url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_ATTEND+'&tq=select+*+where+D+matches+\''+subject_code+'\'+and+E+<=+dateTime+\''+today+' 23:59:59\'+and+E+>=+dateTime+\''+today+' 00:00:00\'',//+order+by+C',
			url: 'test/json_JE1-G11_today.txt',
			success: function (data1) {
				var list_attend = JSON.parse(data1.substring(data1.indexOf('(')+1, data1.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
					total_attend = list_attend.length; // 목록 수.
				//console.log('* SHEET DATA URL - https://docs.google.com/spreadsheets/d/1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4/edit#gid=2098472162'); // 구글 스프레드시트 URL.
				console.log('** 출석 체크한 학생 수: ' + total_attend + '명');

				if (total_attend < 1) {
					//$('.studentList').append( $('<tr><td colspan="9" class="blankTr">선택한 인원이 없습니다.</td></tr>') );
					$('#stTable').html('<p>해당 강의를 선택한 인원이 없습니다.</p>');
					$('.loading-container').fadeOut();
					return false; // break
				}

				var studentTr = new Array();
				var idx_t = -1;

				studentTr[++idx_t] = '<table>';
				studentTr[++idx_t] = '<thead>';
				studentTr[++idx_t] = '<tr>';
				studentTr[++idx_t] = '<th><input type="checkbox" id="selectAll" disabled><!--전체선택--></th>';
				studentTr[++idx_t] = '<th>no</th>';
				studentTr[++idx_t] = '<th>이름</th>';
				studentTr[++idx_t] = '<th>순장</th>';
				studentTr[++idx_t] = '<th>성별</th>';
				studentTr[++idx_t] = '<th>학년</th>';
				studentTr[++idx_t] = '<th>학교</th>';
				studentTr[++idx_t] = '<th>학번</th>';
				studentTr[++idx_t] = '<th>회비</th>';
				studentTr[++idx_t] = '</tr>';
				studentTr[++idx_t] = '</thead>';
				studentTr[++idx_t] = '<tbody>';

				// --------------------------------------------------
				// 2-2. 해당 하는 날짜의 해당 과목 출석 체크한 사람의 정보를 가져옴
				// --------------------------------------------------
				//$.each(list_attend, function(i, item) {
				for(var i=0; i<total_attend; ++i) {
					//console.log('** ' + (i+1) + '  ' + list_attend[i].c[2].v + ' / ' + list_attend[i].c[1].f);
					//list_attend[].c[0] = no (row number)
					//				c[1] = timestamp (attend time for student)
					//				c[2] = phone (student's)
					//				c[3] = subject (code)
					//				c[4] = checktime (check time for teacher)
					//				c[5] = checker (teacher's email)
					//				c[6] = fee (student's / just today)
 					
 					var phoneNumber = list_attend[i].c[2].v;

					// 한 날에 여러번 같은 핸드폰 번호가 있으면 나타나지 않게 함
					if( i<(total_attend-1) && phoneNumber == list_attend[i+1].c[2].v ) {
						console.log('중복 출석 체크한 사람의 앞의 것을 건너뜁니다. ' + phoneNumber);
						return true; // continue
					}

					studentTr[++idx_t] = '<tr class="row' + ii%2 + '">\n';
					studentTr[++idx_t] = '<td><input type="hidden" name="no" value="'+list_attend[i].c[0].v+'">\n';
					studentTr[++idx_t] = '<input type="hidden" name="attend_time" value="';
					studentTr[++idx_t] = (list_attend[i].c[1] != null) ? list_attend[i].c[1].f : list_attend[i].c[4].f; 
					studentTr[++idx_t] = '">\n';
					if(list_attend[i].c[1] != null) { //attendTime 에 가록이 있을 때
						studentTr[++idx_t] = '<input type="hidden" name="whoischecker" value="'+list_attend[i].c[5].v+'">\n';
						studentTr[++idx_t] = '<input type="checkbox" value="'+phoneNumber+'" name="students" checked';
						feeTotal += list_attend[i].c[6].v;						
					} else {
						studentTr[++idx_t] = '<input type="hidden" name="whoischecker" value="">\n';
						studentTr[++idx_t] = '<input type="checkbox" value="'+phoneNumber+'" name="students"';
					}
					studentTr[++idx_t] = '></td>\n';
					studentTr[++idx_t] = '<td>'+(++ii)+'</td>\n';
					studentTr[++idx_t] = '<td>'+attendee_name[phoneNumber]+'</td>\n';	// 이름
					studentTr[++idx_t] = '<td>'+attendee_title[phoneNumber]+'</td>\n';	// 호칭
					studentTr[++idx_t] = '<td>'+attendee_sex[phoneNumber].substr(0,1)+'</td>\n';	// 성별
					studentTr[++idx_t] = '<td>'+attendee_grade[phoneNumber].substr(0,1)+'</td>\n';	// 학년
					studentTr[++idx_t] = '<td>'+attendee_campus[phoneNumber].substr(0,5)+'</td>\n';	// 소속
					studentTr[++idx_t] = '<td>'+attendee_year[phoneNumber].substr(-2) +'</td>\n';	// 학번
					studentTr[++idx_t] = '<td><input type="text" name="fee" class="fee" size="7" value="';
					if(list_attend[i].c[6] != null) {
						studentTr[++idx_t] = list_attend[i].c[6].f;
					} else {
						studentTr[++idx_t] = '0';
					}
					studentTr[++idx_t] = '">원</td>\n';	// 회비
					studentTr[++idx_t] = '</tr>\n';

				}

				studentTr[++idx_t] = '<tr class="row' + ii%2 + '">\n';
				studentTr[++idx_t] = '<td colspan="3" style="text-align:center">총 <strong>' + ii + '</strong> 명</td>\n';
				studentTr[++idx_t] = '<td colspan="6" style="text-align:right">오늘 회비 <strong>' + Number(feeTotal).toLocaleString('en') + '</strong> 원</td>\n';
				studentTr[++idx_t] = '</tr>\n';
				studentTr[++idx_t] = '</tbody>\n';
				studentTr[++idx_t] = '</table>\n';
				//console.log(  );
				$('#stTable').html( studentTr.join('') );

				$('.loading-container').fadeOut();

				// 출석 확인 버튼 생성
				if ( $('#email').val() == checkerList[index].email || $('#email').val() == checkerList[index].assist || $('#email').val() == manage_email || $('#email').val() == admin_email ) {
					$('#attendBtn').removeAttr('disabled').show();
					$('#selectAll').removeAttr('disabled').removeAttr('style');
					$('input[name="students"]').removeAttr('disabled').show();
				} else {
					$('#attendBtn').prop('disabled', true).hide();
					$('#selectAll').prop('disabled', true).hide();
					$('input[name="students"]').prop('disabled', true).hide();
				}

			},
			error: function () {
				alert('출석 명단을 읽어오는데 문제가 발생했습니다.');
			}
		});
	}; // changeSubject {}

	$('#subjectCode').on('change', changeSubject);
	$('#up_date').on('click', changeSubject);

	// --------------------------------------------------
	// 3-1. '출석확인' 처리
	// --------------------------------------------------
	// 1) 데이터 유효성 검사
	// 
	// 2) 버튼 비활성화 (중복 등록 방지)
	//
	// 3) 출석부 시트에 등록 (timestamp, phone, subject)
	//    나머지 column은 spreadsheet 안에서 함수로 가져다 쓸 것 (중복데이터 최소화)
	
	$('#attendBtn').click(function() {
		$('#attendBtn').prop('disabled', true); // 버튼 비활성화
		$('.loading-container').fadeIn();

		var elements = $('input[name="students"]').filter(':checked');
		var elem_length = elements.length;

		if ( elem_length < 1) {
			alert('출석 확인할 명단에 체크하고 "출석 확인"" 버튼을 누르세요.');
			$('#attendBtn').removeAttr('disabled'); // 버튼 활성화 복귀
			$('#selectAll').focus();
			$('.loading-container').fadeOut();
			return false; // break
		}

		var result = confirm( elem_length + '명에 대하여 출석 확인을 하시겠습니까?');
		if ( !result ) {
			$('#attendBtn').removeAttr('disabled'); // 버튼 활성화 복귀
			$('#selectAll').focus();
			$('.loading-container').fadeOut();
			return false; // break
		}

		//console.log($('input[name="students"]'));

		elements.each(function(aa, element) {
		//for( var aa = 0; aa < elem_length; aa++) {
			var index = elements.index(this);

			$.ajax({
				type: 'POST',
				url: WEB_APP_URL + '?sheet_name=' + SHEET_NAME_CONFIRM,
				data: {
					no: $('input[name="no"]:eq('+index+')').val(),
					attendTime: $('input[name="attend_time"]:eq('+index+')').val(),
					phone: $('input[name="students"]:eq('+index+')').val(),
					fee: $('input[name="fee"]:eq('+index+')').val(),
					subject: $('#subjectCode option:selected').val(),
					checker: $('#email').val()
				},
				success: function() {
					//console.log(index+1 + '. ' + $(elements).val() + '님 출석확인 완료');
					console.log(aa+1 + '. ' + $(element).val() + '님 출석확인 완료');
					changeSubject();
				},
				error: function() {
					alert('출석을 기록하는데 에러가 발생했습니다.');
				}
			});
		} //for( var aa
		});

		alert('출석 확인이 완료되었습니다.');
		$('#selectAll').prop('checked', false);
		$('input[name="students"]').prop('checked',false);
		$('body').scrollTop(0);	// 페이지 맨 위로 이동
		$('.loading-container').fadeOut();
		$('#attendBtn').removeAttr('disabled'); // 버튼 활성화 복귀
	});


	// --------------------------------------------------
	// 4-1. 출석 취소 기능
	// --------------------------------------------------
	//$('input[name="students"]').click(function() {
	$(document).on('click', 'input[name="students"]', function(){

		//var n = $('input[name="students"]:not(:checked)');
		if( $(this).is(':checked') == true ) {
			//alert('checked');
			return true; // continue
		}
		
		// 출석확인 되어 있는 사람이 아닐 경우 아무 일도 일어나지 않음
		var index = $('input[name="students"]').index(this);
		var no = $('input[name="no"]:eq('+index+')').val(),
			whoischecker = $('input[name="whoischecker"]:eq('+index+')').val(),
			phoneNumber = $('input[name="students"]:eq('+index+')').val();
		//var mm = 'no='+no+', attend_time='+attend_time+', whoischecker='+whoischecker;
		//	mm += ', phoneNumber='+phoneNumber+', name='+attendee_name[phoneNumber];
		//console.log(mm);
		
		// uncheck 될 때, 기존 출석확인이 되어있는지 검사 input[name="whoischecker"]:eq(index)
		if( whoischecker == null || whoischecker == '') {
			console.log('기존에 출석확인이 되어있지 않습니다.');
			return true; // continue
		}

		// 기존 출석확인이 아니면 return true;

		// 기존 출석확인자면 취소 루틴 실행
		var msg = confirm( attendee_name[phoneNumber] + '님의 출석 확인을 취소하시겠습니까?' );
			// 취소할 것인지 묻기
		if (!msg) return false; // brake

			// $.ajax
			// no를 기준으로
			// attendTime -> Timestamp
			// attendTime = ''
			// checker = ''
			// fee 는 그대로
		$.ajax({
				type: 'POST',
				url: WEB_APP_URL + '?sheet_name=' + SHEET_NAME_CONFIRM,
				data: {
					no: no,
					attendTime: '',
					phone: phoneNumber,
					subject: $('#subjectCode option:selected').val(),
					Timestamp: $('input[name="attend_time"]:eq('+index+')').val(),
					checker: '',
					fee: $('input[name="fee"]:eq('+index+')').val()
				},
				success: function() {
					console.log(attendee_name[phoneNumber] + '님 출석 취소');
					alert(attendee_name[phoneNumber] + '님의 출석 확인이 취소되었습니다.');
					changeSubject();
				},
				error: function() {
					alert('출석을 기록하는데 에러가 발생했습니다.');
				}
			});


	});

	// --------------------------------------------------
	// 전체선택 소스
	// --------------------------------------------------
	var checkAll = function() {
		//console.log('check All');
		if ( $('#selectAll').prop('checked') ) {
			$('input[name="students"]').prop('checked', true);
		} else {
			$('input[name="students"]').prop('checked',false);
		}
	};
	$(document).on('click', '#selectAll', checkAll);
	//$('#selectAll').on('click', checkAll);

});
