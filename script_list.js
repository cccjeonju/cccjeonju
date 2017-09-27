document.getElementById('now_date').valueAsDate = new Date();

var clientId = '62990643006-squj2admavms41d94p4gkn3ef256dfn9.apps.googleusercontent.com';

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');
var GoogleAuth;

var handleClientLoad = function() {
	gapi.load('auth2', function(){
	  // Retrieve the singleton for the GoogleAuth library and set up the client.
	  auth2 = gapi.auth2.init({
	    client_id: clientId,
	    cookiepolicy: 'single_host_origin',
	    // Request scopes in addition to 'profile' and 'email'
	    //scope: 'additional_scope'
	  }).then( function () {
	  	// Listen for sign-in state changes.
	  	gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

	  	// Handle the initial sign-in state.
	  	updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

	  	authorizeButton.onclick = handleAuthClick;
	    signoutButton.onclick = handleSignoutClick;
	  });

	  function updateSigninStatus(isSignedIn) {
	    if (isSignedIn) {
	      authorizeButton.style.display = 'none';
	      signoutButton.style.display = 'inline-block';
	      makeApiCall();
	    } else {
	      authorizeButton.style.display = 'inline-block';
	      signoutButton.style.display = 'none';
	      removeCall();
	    }
	  }
	  function handleAuthClick(event) {
	    gapi.auth2.getAuthInstance().signIn().then(function(){
	    	console.log('Login complete.');
	    	window.location.reload(true);
	    });
	  }
	  function handleSignoutClick(event) {
	    gapi.auth2.getAuthInstance().signOut().then(function(){
	    	console.log('User signed out.');
	    });
	    gapi.auth2.getAuthInstance().disconnect();
	  }

	  // Load the API and make an API call.  Display the results on the screen.
	  function makeApiCall() {
	    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
	      var profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
	      var p = document.createElement('p');
	      var name = profile.getName();
	      var email = profile.getEmail();
	      p.setAttribute('class', 'welcome');
	      p.appendChild(document.createTextNode(name+'님 ('+email+') '));
	      document.getElementById('gSignInWrapper').prepend(p);
	      document.getElementById('email').value = email;
	      document.getElementById('checker').value = name;
	      //document.getElementById('checkAll').style.display = 'block';
	      //document.getElementById('checkAll').disabled = false;
	      for(var i=0; i<document.getElementsByName('students').length; i++) {
	      	document.getElementsByName('students').style.display = 'block';
	      	document.getElementsByName('students').disabled = false;
		  }
	    }
	  }

	  function removeCall() {
	      gapi.auth2.getAuthInstance().currentUser.length = 0;
	      document.getElementById('gSignInWrapper').removeChild(document.getElementById('gSignInWrapper').firstChild);
	      document.getElementById('email').value = "";
	      document.getElementById('checker').value = "";
	      //document.getElementById('checkAll').style.display = 'none';
	      //document.getElementById('checkAll').disabled = true;
	      for(var i=0; i<document.getElementsByName('students').length; i++) {
	      	document.getElementsByName('students').style.display = 'none';
	      	document.getElementsByName('students').disabled = true;
		  }
	  }
	});
}

$(function($){

	var KEY_SPREADSHEET = '1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4',	// Spreadsheet Key
		GID_SHEET_REGIST = '132886731',			// 등록부
		GID_SHEET_ATTEND = '1980648270',		// 출석부
		GID_SHEET_SUBJECT= '2098472162';		// 개설강의 목록
	var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyOpp8Fl9V5DAd_ZjsDSI12z7oQLOLufI3HfipWxiUMvngxeOIq/exec',	// 출석부에 기록하기 위한 웹 앱
		SHEET_NAME_CONFIRM = '출석부';

	var admin_email = 'cccjeonju@gmail.com',
		manage_email = 'hiyen2001@gmail.com';

	var checkerList = new Array();

	// 전체선택 소스
	$('#checkAll').click(function(){
		if ( $('#checkAll').prop('checked') ) $('input[name="students"]').prop('checked', true);
		else $('input[name="students"]').prop('checked',false);
	});

	// --------------------------------------------------
	// 1-1. 출석체크가 초기 실행되면 개설된 강의 목록을 읽어와야 함
	// 1-2. 로딩이 끝나면 loadingbar fadeout 효과를 
	// --------------------------------------------------
	$.ajax({
		url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_SUBJECT
	}).done(function (data) {
		var subject_list = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
			sum = subject_list.length; // 목록 수.

		//console.log('* SHEET DATA URL - https://docs.google.com/spreadsheets/d/1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4/edit?usp=sharing'); // 구글 스프레드시트 URL.
		console.log('* 전체 강의 수: ' + sum + '개');

		for (var i = 0; i < sum; i++) { // 전체 강의 목록을 콘솔에 출력. 
			// subject_list[].c[4] = 강의코드
			//				 .c[6] = 강의자명
			//				 .c[7] = 강의자 email
			//				 .c[8] = 보조자 email
		    //console.log(i+1 + '  ' + subject_list[i].c[5].v + ' / ' + subject_list[i].c[4].v + ' / ' + subject_list[i].c[6].v);
		    var opt = '<option value="' + subject_list[i].c[4].v.toString() + '">';
		    	opt += '[' + subject_list[i].c[1].v + '] '
		    if( subject_list[i].c[2] != null ) { opt += subject_list[i].c[2].v + ' ' + subject_list[i].c[1].v + ' '; }
		    opt += subject_list[i].c[6].v.toString() + ' / ' + subject_list[i].c[5].v.toString() + '</option>\n';
		    $('#subjectCode').append( $(opt) );

		    checkerList[i] = new Object();
		    checkerList[i].code = subject_list[i].c[4].v;
		    checkerList[i].name = subject_list[i].c[6].v;
		    if(subject_list[i].c[7] != null) checkerList[i].email= subject_list[i].c[7].v;
		    if(subject_list[i].c[8] != null) checkerList[i].assist = subject_list[i].c[8].v;
		}
		$('.loading-container').fadeOut(); // 로딩바 제거.
	}).fail(function () {
		alert('데이터 불러오기 실패. 아마도 jQuery CDN 또는 일시적인 구글 API 문제.');
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
			url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_ATTEND+'&tq=select+*+where+D+matches+\''+subject_code+'\'+and+E+<=+dateTime+\''+today+' 23:59:59\'+and+E+>=+dateTime+\''+today+' 00:00:00\'+order+by+C',
			success: function (data1) {
				var list_attend = JSON.parse(data1.substring(data1.indexOf('(')+1, data1.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
					total_attend = list_attend.length; // 목록 수.
				//console.log('* SHEET DATA URL - https://docs.google.com/spreadsheets/d/1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4/edit#gid=2098472162'); // 구글 스프레드시트 URL.
				//console.log('** 출석 체크한 학생 수: ' + total_attend + '명');

				if (total_attend < 1) {
					//$('.studentList').append( $('<tr><td colspan="9" class="blankTr">선택한 인원이 없습니다.</td></tr>') );
					$('#stTable').html('<p>강의를 선택하시면 명단을 불러옵니다.</p>');
					$('.loading-container').fadeOut();
					return;
				}

				var studentTr = new Array();
				var idx_t = -1;

				studentTr[++idx_t] = '<table>';
				studentTr[++idx_t] = '<thead>';
				studentTr[++idx_t] = '<tr>';
				studentTr[++idx_t] = '<th><input type="checkbox" id="checkAll" disabled><!--전체선택--></th>';
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
 
					// 한 날에 여러번 같은 핸드폰 번호가 있으면 나타나지 않게 함
					if( i<(total_attend-1) && list_attend[i].c[2].v == list_attend[i+1].c[2].v ) {
						console.log('중복 출석 체크한 사람의 앞의 것을 건너뜁니다. ' + list_attend[i].c[2].v);
						return true;
					}

				    $.ajax({
				    	type: 'GET',
				    	cache: false,
				    	async: false,
						url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_REGIST+'&tq=select+*+where+D+matches+\''+list_attend[i].c[2].v+'\'' // phone number로 user 정보 가져오기
					}).done(function(data2) {
						var attendee = JSON.parse(data2.substring(data2.indexOf('(')+1, data2.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
							attendee_total = attendee.length; // 목록 수.
						//console.log('*** 출석체크 한 사람 중 읽어오기 : ' + users + '명 - 2명 이상일 경우는 데이터 유효성 결여상태');

						// users=1 이어야 하지만 데이터 무결성을 위하여 반복문 사용
						if( attendee_total>1 ) {
							alert('중복된 사용자가 있습니다. 확인하세요.');
							return;
						}

						//console.log('*** ' + (i+1) + ' ' + list_attend[i].c[3].v + ' ' + attendee[0].c[1].v + ' ' + attendee[0].c[3].v + ' ' + attendee[0].c[5].v);
						//$('#stTable').append( $('<li><label><input type="radio" name="subject" value="' + attendee[0].c[4].v.toString() + '">[' + attendee[0].c[1].v.toString() + '] ' + attendee[0].c[6].v.toString() + ' / ' + attendee[0].c[5].v.toString() + '</label></li>') );
						// attendee[].c[0] = timestamp
						//			1] = name (student's)
						//			2] = sex
						//			3] = phone
						//			4] = grade
						//			5] = campus name
						//			6] = starting year
						//			7] = register
						//			8] = title (soonjang)
						//			9] = 11/9 subject, [10]=11/16, [11]=11/23
						//			12]= application
						//			13]= total fee
						studentTr[++idx_t] = '<tr class="row' + ii%2 + '">\n';
						studentTr[++idx_t] = '<td><input type="hidden" name="no" value="'+attendee[0].c[0].v+'">\n';
						studentTr[++idx_t] = '<input type="hidden" name="attend_time" value="';
						studentTr[++idx_t] = (attendee[0].c[1] != null) ? attendee[0].c[1].f : attendee[0].c[4].f; 
						studentTr[++idx_t] = '">\n';
						studentTr[++idx_t] = '<input type="checkbox" value="'+attendee[0].c[3].v+'" name="students"';
						if(list_attend[i].c[1] != null) { //attendTime에 가록이 있을 때
							studentTr[++idx_t] = ' checked';
						}
						studentTr[++idx_t] = '></td>\n';
						studentTr[++idx_t] = '<td>'+(++ii)+'</td>\n';
						studentTr[++idx_t] = '<td>'+attendee[0].c[1].v+'</td>\n';	// 이름
						studentTr[++idx_t] = '<td>'+attendee[0].c[8].v+'</td>\n';	// 호칭
						studentTr[++idx_t] = '<td>'+attendee[0].c[2].v.substr(0,1)+'</td>\n';	// 성별
						studentTr[++idx_t] = '<td>'+attendee[0].c[4].v.substr(0,1)+'</td>\n';	// 학년
						studentTr[++idx_t] = '<td>'+attendee[0].c[5].v.substr(0,5)+'</td>\n';	// 소속
						studentTr[++idx_t] = '<td>'+attendee[0].c[6].f.substr(-2) +'</td>\n';	// 학번
						studentTr[++idx_t] = '<td><input type="text" name="fee" class="fee" size="7" value="';
						if(attendee[0].c[13] != null) {
							feeTotal +=  attendee[0].c[13].v;
							studentTr[++idx_t] = attendee[0].c[13].f;
						} else {
							studentTr[++idx_t] = '0';
						}
						studentTr[++idx_t] = '">원</td>\n';	// 회비
						studentTr[++idx_t] = '</tr>\n';

					}).fail(function() {
				    	alert('출석한 사용자(' + list_attend[i].c[2].v + ')의 정보를 읽어오는데 실패했습니다.');
				    });
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
					$('#checkAll').removeAttr('disabled').removeAttr('style');
					$('input[name="students"]').removeAttr('disabled').show();
					$('input[name="cancel-button"]').removeAttr('disabled').show();
				} else {
					$('#attendBtn').prop('disabled', true).hide();
					$('#checkAll').prop('disabled', true).hide();
					$('input[name="students"]').prop('disabled', true).hide();
					$('input[name="cancel-button"]').prop('disabled', true).hide();
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

		if ($('input[name="students"]:checked').length < 1) {
			alert('출석 확인할 명단에 체크하고 "출석 확인"" 버튼을 누르세요.');
			$('#attendBtn').removeAttr('disabled'); // 버튼 활성화 복귀
			$('#checkAll').focus();
			$('.loading-container').fadeOut();
			return false;
		}

		var result = confirm($('input[name="students"]').filter(':checked').length + '명에 대하여 출석 확인을 하시겠습니까?');
		if ( !result ) {
			$('#attendBtn').removeAttr('disabled'); // 버튼 활성화 복귀
			$('#checkAll').focus();
			$('.loading-container').fadeOut();
			return false;
		}

		//console.log($('input[name="students"]'));

		$('input[name="students"]').filter(':checked').each(function(aa, elements) {
		//for( var aa = 0; aa < $('input[name="students"]').prop('checked').length; aa++) {
			var index = $(elements).index('input[name="students"]');

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
				success: function(data3) {
					console.log(aa+1 + '. ' + $(elements).val() + '님 출석확인 완료');
					changeSubject();
				},
				error: function() {
					alert('출석을 기록하는데 에러가 발생했습니다.');
				}
			});
		//} //for( var aa
		});
		alert('출석 확인이 완료되었습니다.');
		$('#checkAll').prop('checked', false);
		$('input[name="students"]').prop('checked',false);
		$('body').scrollTop(0);	// 페이지 맨 위로 이동
		$('.loading-container').fadeOut();
		$('#attendBtn').removeAttr('disabled'); // 버튼 활성화 복귀

	});

	// --------------------------------------------------
	// 4-1. 출석 취소 기능
	// --------------------------------------------------
	$('input[name="students"]').click(function() {
		// 출석확인 되어 있는 사람이 아닐 경우 아무 일도 일어나지 않음

	});

});
