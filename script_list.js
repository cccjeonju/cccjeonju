$(function(){

	var KEY_SPREADSHEET = "1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4",	// Spreadsheet Key
		GID_SHEET_REGIST = "1095637889",//"132886731",		// 등록부
		GID_SHEET_ATTEND = "1980648270",		// 출석부
		GID_SHEET_SUBJECT= "2098472162";	// 개설강의 목록
	var KEY_SHEET_ATTEND = "https://script.google.com/macros/s/AKfycbyOpp8Fl9V5DAd_ZjsDSI12z7oQLOLufI3HfipWxiUMvngxeOIq/exec";	// 출석부에 기록하기 위한 웹 앱

	var subject_code = "";
	// --------------------------------------------------
	// 1-1. 출석체크가 초기 실행되면 개설된 강의 목록을 읽어와야 함
	// 1-2. 로딩이 끝나면 loadingbar fadeout 효과를 
	// --------------------------------------------------
	$.ajax({
		url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_SUBJECT
	}).done(function (data) {
		var list = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
			sum = list.length; // 목록 수.

		//console.log('* SHEET DATA URL - https://docs.google.com/spreadsheets/d/1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4/edit?usp=sharing'); // 구글 스프레드시트 URL.
		console.log('* 전체 강의 수: ' + sum + '개');

		for (var i = 0; i < sum; i++) { // 전체 강의 목록을 콘솔에 출력. 
		    //console.log(i+1 + '  ' + list[i].c[5].v + ' / ' + list[i].c[4].v + ' / ' + list[i].c[6].v);
		    $('#subjectCode').append( $('<option value="' + list[i].c[4].v.toString() + '">' + list[i].c[6].v.toString() + ' / ' + list[i].c[5].v.toString() + '</option>\n') );
		}
		$('.loading-container').fadeOut(); // 로딩바 제거.

		// --------------------------------------------------
		// 2-1. 과목을 선택했을 때 - 출석부 시트에서 오늘(특정) 날짜가 있고, 선택된 과목의 레코드들을 읽어옴
		// --------------------------------------------------
		var changeSubject = function() {
			$('.studentList').empty(); // 명단을 초기화해서 모두 지움

			subject_code = $('#subjectCode option:selected').val();

			$.ajax({
				url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_ATTEND+'&tq=select+*+where+C+matches+\''+subject_code+'\''
			}).done(function (data1) {
				var list_attend = JSON.parse(data1.substring(data1.indexOf('(')+1, data1.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
					total = list_attend.length; // 목록 수.
				//console.log('* SHEET DATA URL - https://docs.google.com/spreadsheets/d/1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4/edit#gid=2098472162'); // 구글 스프레드시트 URL.
				console.log('** 출석 체크한 수: ' + total + '명');

				if (total < 1) {
					$('.studentList').append( $('<tr class=""><td colspan="9">선택한 인원이 없습니다.</td></tr>') );
					return;
				}
				for (var j = 0; j < total; j++) {
				    //console.log("** " + (j+1) + '  ' + list_attend[j].c[2].v + ' / ' + list_attend[j].c[1].v);
				    $('.loading-container').fadeIn();

				    phoneNumber = list_attend[j].c[1].v;

				    $.ajax({
				    	url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_REGIST+'&tq=select+*+where+D+matches+\''+phoneNumber+'\''
				    }).done(function(data2){
						var user = JSON.parse(data2.substring(data2.indexOf('(')+1, data2.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
							users = user.length; // 목록 수.
						console.log('*** 출석체크 한 사람 중 읽어오기 : ' + users + '명 - 2명 이상일 경우는 데이터 유효성 결여상태');
						
						for (var k = 0; k < users; k++) {
					    	console.log("*** " + (k+1) + '  ' + user[k].c[5].v + ' / ' + user[k].c[4].v + ' / ' + user[k].c[6].v);
						    //$('.studentList').append( $('<li><label><input type="radio" name="subject" value="' + user[k].c[4].v.toString() + '">[' + user[k].c[1].v.toString() + '] ' + user[k].c[6].v.toString() + ' / ' + user[k].c[5].v.toString() + '</label></li>') );

							var studentTr = "<tr class=\"\">\n";
							studentTr += "<td class=\"co1\"><input type=\"checkbox\" name=\"students\" value=\""+user[k].c[2].v + "\"></td>\n";
							studentTr += "<td class=\"co2\">"+(k+1)+"</td>";
							studentTr += "<td class=\"co3\">"+user[k].c[1].v+"</td>\n";	// 아름
							studentTr += "<td class=\"co4\">"+user[k].c[8].v+"</td>\n";	// 호칭
							studentTr += "<td class=\"co5\">"+user[k].c[2].v.toString().substr(0,1)+"</td>\n";	// 성별
							studentTr += "<td class=\"co6\">"+user[k].c[4].v.toString().substr(0,1)+"</td>\n";	// 학년
							studentTr += "<td class=\"co7\">"+user[k].c[5].v.toString().substr(0,5)+"</td>\n";	// 소속
							studentTr += "<td class=\"co8\">"+user[k].c[6].v.toString().substr(-2)+"</td>\n";	// 학번
							studentTr += "<td class=\"co9\">"+user[k].c[1].v+" 원</td>\n";	// 회비 *******************
							studentTr += "</tr>\n";

							$('.studentList').append( studentTr );
						}

				    }).fail(function(){
				    	alert("출석한 사용자의 정보를 읽어오는데 실패했습니다.");
				    });
				}
				$('.loading-container').fadeOut();

				// --------------------------------------------------
				// 2-1. '등록 확인'을 최초로 누르면 등록부 시트로부터 등록자 명단을 가져온다. 
				// 2-2. 가져온 명단을 전역변수로 가지고 있으면서 등록자인지 체크하여 화면에 표시한다.
				// --------------------------------------------------
				var checkID = function() { // 등록자 검색
					//var num = parseInt(Math.random()*sum); // 난수 생성.

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
						console.log('* 전체 등록자 수: ' + total + '명');
						//console.log('* PHONE = ' + phoneNumber);
						if (total<1) {
							$('output>a').html(phoneNumber + ' 는 아직 등록이 되지 않았습니다.<br>여기를 눌러 \'등록\'을 먼저해주세요.').attr('href', 'https://goo.gl/ZFfX76');

						} else {
							//console.log(students[0].c[3].v + ' ' + students[0].c[1].v + ' ' + students[0].c[8].v + '님 (' + students[0].c[5].v + ' ' + students[0].c[6].v.toString().substr(-2) + '학번)');
							$('output').attr('style', 'display:block');
							$('output>a').html(students[0].c[3].v + '<br>' + students[0].c[1].v + ' ' + students[0].c[8].v + '님 (' + students[0].c[5].v + ' ' + students[0].c[6].v.toString().substr(-2) + '학번)\n');
							$('input[name="phoneCheck"]').val(students[0].c[3].v.toString().substr(-4));
						}
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
					$('.loading-container').fadeIn();

					if (!$('#phone').val()) {
						alert('핸드폰번호를 입력하고 \'등록 확인\' 버튼을 누르세요.');
						$('#submitBtn').prop('disabled', false); // 버튼 활성화 복귀
						$('#phone').focus();
						return false;
					}

					//console.log( $('input[name="phoneCheck"]').val() );
					//console.log( phoneNumber );

					if ($('input[name="phoneCheck"]').val() != phoneNumber.substr(-4)) {
						alert('등록하신 게 맞습니까?\n\'등록 확인\' 버튼을 눌러 진행하거나 \'등록\'해주세요.');
						$('#submitBtn').prop('disabled', false); // 버튼 활성화 복귀
						$('#phone').focus();
						return false;
					}

					//console.log('핸드폰 입력 확인');

					var subject_selected = $(':radio[name="subject"]:checked').val();
					if (!subject_selected) {
						alert('수강하는 과목을 선택하세요.');
						$('#submitBtn').prop('disabled', false); // 버튼 활성화 복귀
						return false;
					}

					//console.log('수강과목 선택 확인');
					//console.log(subject_selected);

					$.ajax({
						url: KEY_SHEET_ATTEND,
						data: {
							phone: phoneNumber,
							subject: subject_selected
						}
					}).done(function(data){
						//console.log(data);
						alert('출석이 되었습니다.');
						$('#submitBtn').prop('disabled', false);
						$('#phone').val('');
						$('input[name="phoneCheck"]').val('');
						$('output>a').text('');
						$('output').attr('style', 'display:none');
						$('input:radio[name="subject"]').prop('checked', false);
						$('body').scrollTop(0);	// 페이지 맨 위로 이동
						$('.loading-container').fadeOut();
					}).fail(function(){
						alert('출석을 기록하는데 에러가 발생했습니다.');
						$('#submitBtn').prop('disabled', false); // 버튼 활성화 복귀
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
				alert('출석 명단을 읽어오는데 문제가 발생했습니다.');
			});
		} // changeSubject {}

		$('#subjectCode').on('change', changeSubject); // 과목 바꾸면 리스트 갱신

	}).fail(function () {
				alert('데이터 불러오기 실패. 아마도 jQuery CDN 또는 일시적인 구글 API 문제.');
			});
});
