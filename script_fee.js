$(function($){

	var KEY_SPREADSHEET  = '1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4',	// Spreadsheet Key
		GID_SHEET_REGIST = '132886731';		// 등록부
	var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyOpp8Fl9V5DAd_ZjsDSI12z7oQLOLufI3HfipWxiUMvngxeOIq/exec',	// 출석부에 기록하기 위한 웹 앱
		SHEET_NAME_ATTEND = '출석부';

	$('.loading-container').fadeOut();

	// --------------------------------------------------
	// 1. 이름으로 등록자 명단 검색
	// --------------------------------------------------
	$('#checkIdBtn').click(function(){ // 등록자 검색

		whois_name = $('#whois').val();

		$.ajax({
			// 이름과 같은 열을 가져옴
			url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_REGIST+'&tq=select+*+where+B+matches+\''+whois_name+'\'',
			success: function (data) {
				var students = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
					total = students.length; // 목록 수.
			
				console.log('* 검색된 등록자 수: ' + total + '명');

				if (total < 1) {
					$('#stTable').html('<p>해당 이름의 등록자가 없습니다.<br> 아직 등록하지 않은 수강자라면 등록 절차를 안내해주세요.</p>');
					return false; // break
				}
				
				$('.loading-container').fadeIn();
				
				var studentTr = [];
				var idx = -1,
					ii  = 0;

				studentTr[++idx] = '<table>';
				studentTr[++idx] = '<thead>';
				studentTr[++idx] = '<tr>';
				studentTr[++idx] = '<th></th>';
				studentTr[++idx] = '<th>no</th>';
				studentTr[++idx] = '<th>이름</th>';
				studentTr[++idx] = '<th>순장</th>';
				studentTr[++idx] = '<th>성별</th>';
				studentTr[++idx] = '<th>학년</th>';
				studentTr[++idx] = '<th>학교</th>';
				studentTr[++idx] = '<th>학번</th>';
				studentTr[++idx] = '<th>회비</th>';
				studentTr[++idx] = '</tr>';
				studentTr[++idx] = '</thead>';
				studentTr[++idx] = '<tbody>';

				// students[].c[0] = timestamp _____(f값)
				//				1] = name (student's)
				//				2] = sex
				//				3] = phone
				//				4] = grade
				//				5] = campus name
				//				6] = starting year _____(f값)
				//				7] = register
				//				8] = title (soonjang)
				//				9] = 11/9 subject, [10]=11/16, [11]=11/23
				//				12]= application
				//				13]= total fee _____(f값)
				for(var i=0; i<total; i++) {
					studentTr[++idx] = '<tr class="row' + ii%2 + '">\n';
					studentTr[++idx] = '<td><input type="radio" value="'+students[i].c[3].v+'" name="phone"></td>\n';
					studentTr[++idx] = '<td>'+(++ii)+'</td>\n';
					studentTr[++idx] = '<td>'+students[i].c[1].v+'</td>\n';	// 이름
					studentTr[++idx] = '<td>'+students[i].c[8].v+'</td>\n';	// 호칭
					studentTr[++idx] = '<td>'+students[i].c[2].v.substr(0,1)+'</td>\n';	// 성별
					studentTr[++idx] = '<td>'+students[i].c[4].v.substr(0,1)+'</td>\n';	// 학년
					studentTr[++idx] = '<td>'+students[i].c[5].v.substr(0,5)+'</td>\n';	// 소속
					studentTr[++idx] = '<td>'+students[i].c[6].f.substr(-2) +'</td>\n';	// 학번
					studentTr[++idx] = '<td>'+students[i].c[13].f+'">원</td>\n';	// 회비
					studentTr[++idx] = '</tr>\n';
				}
				studentTr[++idx] = '</tbody>\n';
				studentTr[++idx] = '</table>\n';
				$('#stTable').html( studentTr.join('') );

				$('.loading-container').fadeOut();

			},
			error: function(){
				alert('등록자 검색 실패');
			}
		});
	});

	// --------------------------------------------------
	// 2. '회비 납부' 처리
	// --------------------------------------------------
	// 1) 데이터 유효성 검사
	// 
	// 2) 버튼 비활성화 (중복 등록 방지)
	//
	// 3) 출석부 시트에 등록 (timestamp, phone, attendTime)
	//    나머지 column은 spreadsheet 안에서 함수로 가져다 쓸 것 (중복데이터 최소화)
	$('#submitBtn').click(function(){

		var phoneNumber = $('input[name="phone"]:checked').val();

		if (!phoneNumber) {
			alert('등록자가 선택되지 않았습니다. 확인해주세요.');
			return false; // break
		}

		var fee = $('#fee').val();
		if (fee == '' || fee == null) {
			alert('회비를 입력해주세요.');
			$('#fee').focus();
			return false; // break
		}

		// 숫자 형식 체크 정규식
		var regExp = /^[0-9]*$/;
		if (!regExp.test( fee )) {
			alert('회비는 숫자 입력만 가능합니다.');
			$('#fee').focus();
			return false; // break
		}

		var newDate = new Date();
		var year= newDate.getFullYear();
		var mon = (newDate.getMonth()+1)>9 ? ''+(newDate.getMonth()+1) : '0'+(newDate.getMonth()+1);
		var day = newDate.getDate()>9 ? ''+newDate.getDate() : '0'+newDate.getDate();
		var hour= newDate.getHours();
		var min = newDate.getMinutes();
		var sec = newDate.getSeconds();
			newDate = year + '-' + mon + '-' + day + ' ' + hour + ':' + min + ':' + sec;

		//$('#submitBtn').prop('disabled', true); // 버튼 비활성화
		$('#submitBtn').attr('disabled', true); // 버튼 비활성화
		$('.loading-container').fadeIn();

		return false;

		$.ajax({
			url: WEB_APP_URL + '?sheet_name=' + SHEET_NAME_ATTEND,
			data: {
				no: '',
				attendTime: newDate,
				phone: phoneNumber,
				subject: '',
				//Timestamp:
				checker: $('#email').val(),
				fee: fee
			},
			success: function(data){
				var msg = $('input[name="studentName"]').val() + '/' + $('input[name="phoneCheck"]').val() + '/' + phoneNumber + '/' + subject_selected + '/' + fee;
				console.log(msg);
				alert($('input[name="studentName"]').val()+'님의 회비 납부가 처리 되었습니다.');

				$('#submitBtn').removeAttr('disabled');
				$('#fee').val('');
				$('#stTable').empty();
				$('input:radio[name="phone"]').prop('checked', false);
				$('body').scrollTop(0);	// 페이지 맨 위로 이동
				$('.loading-container').fadeOut();
			},
			error: function(){
				alert('회비 납부를 처리하는데 에러가 발생했습니다.');
				$('#submitBtn').removeAttr('disabled'); // 버튼 활성화 복귀
			}
		});
	}); 
});
