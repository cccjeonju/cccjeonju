$(function(){

	var KEY_SPREADSHEET = "1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4",	// Spreadsheet Key
		GID_SHEET_REGIST = "1095637889",//"132886731",		// 등록부
		GID_SHEET_ATTEND = "1980648270",		// 출석부
		GID_SHEET_SUBJECT= "2098472162";	// 개설강의 목록
	var WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyOpp8Fl9V5DAd_ZjsDSI12z7oQLOLufI3HfipWxiUMvngxeOIq/exec",	// 출석부에 기록하기 위한 웹 앱
		SHEET_NAME_CONFIRM = "출석확인";

	var attendTime = [];
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
			$('.loading-container').fadeIn();
			$('.studentList').empty(); // 명단을 초기화해서 모두 지움

			var subject_code = $('#subjectCode option:selected').val();
			var ii = 0; // 현재 반의 인원

			$.ajax({
				// =============================================
				// Query 조건문 추가해야함 (오늘 날짜)
				// =============================================
				type: 'GET',
				url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_ATTEND+'&tq=select+*+where+C+matches+\''+subject_code+'\'',
				success: function (data1) {
					var list_attend = JSON.parse(data1.substring(data1.indexOf('(')+1, data1.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
						total = list_attend.length; // 목록 수.
					//console.log('* SHEET DATA URL - https://docs.google.com/spreadsheets/d/1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4/edit#gid=2098472162'); // 구글 스프레드시트 URL.
					console.log('** 출석 체크한 수: ' + total + '명');

					if (total < 1) {
						$('.studentList').append( $('<tr class=""><td colspan="9" class="blankTr">선택한 인원이 없습니다.</td></tr>') );
						$('.loading-container').fadeOut();
						return;
					}

					// --------------------------------------------------
					// 2-2. 해당 하는 날짜의 해당 과목 출석 체크한 사람의 정보를 가져옴
					// --------------------------------------------------
					for (var j = 0; j < total; j++) {
					    console.log("** " + (j+1) + '  ' + list_attend[j].c[2].v + ' / ' + list_attend[j].c[1].v);

					    attendTime[ii]  = list_attend[j].c[0].f;

					    $.ajax({
					    	type: 'GET',
					    	async: false,
							url: 'https://docs.google.com/spreadsheets/d/'+KEY_SPREADSHEET+'/gviz/tq?gid='+GID_SHEET_REGIST+'&tq=select+*+where+D+matches+\''+list_attend[j].c[1].v+'\'',
							success: function(data2) {				    
								var user = JSON.parse(data2.substring(data2.indexOf('(')+1, data2.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
									users = user.length; // 목록 수.
								console.log('*** 출석체크 한 사람 중 읽어오기 : ' + users + '명 - 2명 이상일 경우는 데이터 유효성 결여상태');
								
								for (var k = 0; k < users; k++) {
							    	console.log("*** " + (k+1) + '  ' + user[k].c[5].v + ' / ' + user[k].c[4].v + ' / ' + user[k].c[6].v);
								    //$('.studentList').append( $('<li><label><input type="radio" name="subject" value="' + user[k].c[4].v.toString() + '">[' + user[k].c[1].v.toString() + '] ' + user[k].c[6].v.toString() + ' / ' + user[k].c[5].v.toString() + '</label></li>') );

									var studentTr = "<tr class=\"\">\n";
									studentTr += "<td class=\"co1\"><input type=\"checkbox\" name=\"students\" value=\""+user[k].c[3].v+"\">";
									studentTr += "<input type=\"hidden\" name=\"attend_time\" value=\""+attendTime[ii]+"\"></td>\n";
									studentTr += "<td class=\"co2\">"+(++ii)+"</td>\n"; 
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
							},
							error: function() {
					    		alert("출석한 사용자의 정보를 읽어오는데 실패했습니다.");
					    	}
					    });
					}
					$('.loading-container').fadeOut();
				},
				error: function () {
					alert('출석 명단을 읽어오는데 문제가 발생했습니다.');
				}
			});
		} // changeSubject {}

		$('#subjectCode').on('change', changeSubject); // 과목 바꾸면 리스트 갱신

	}).fail(function () {
				alert('데이터 불러오기 실패. 아마도 jQuery CDN 또는 일시적인 구글 API 문제.');
	});

	// 전체선택 소스
	$('#checkAll').click(function(){
		if ( $('#checkAll').prop('checked') ) $('input[name="students"]').prop('checked', true);
		else $('input[name="students"]').prop('checked',false);
	});

	// --------------------------------------------------
	// 3-1. '출석확인' 처리
	// --------------------------------------------------
	// 1) 데이터 유효성 검사
	// 
	// 2) 버튼 비활성화 (중복 등록 방지)
	//
	// 3) 출석부 시트에 등록 (timestamp, phone, subject)
	//    나머지 column은 spreadsheet 안에서 함수로 가져다 쓸 것 (중복데이터 최소화)

	var submitConfirm = function() {
		$('#attendBtn').prop('disabled', true); // 버튼 비활성화
		$('.loading-container').fadeIn();

		if ($('input[name="students"]:checked').length < 1) {
			alert('출석 확인할 명단에 체크하고 \'출석 확인\' 버튼을 누르세요.');
			$('#attendBtn').prop('disabled', false); // 버튼 활성화 복귀
			$('#checkAll').focus();
			$('.loading-container').fadeOut();
			return false;
		}

		var result = confirm($('input[name="students"]:checked').length + '명에 대하여 출석 확인을 하시겠습니까?');
		if ( !result ) {
			$('#attendBtn').prop('disabled', false); // 버튼 활성화 복귀
			$('#checkAll').focus();
			$('.loading-container').fadeOut();
			return false;
		}

		//console.log($('input[name="students"]'));

		//var timestp = Math.floor(new Date().getTime() / 1000);

		$('input[name="students"]:checked').each(function(aa, elements) {
		//for( var l = 0; l < $('input[name="students"]').prop('checked').length; l++) {
			var index = $(elements).index('input[name="students"]');

			$.ajax({
				type: 'GET',
				url: WEB_APP_URL + '?sheet_name=' + SHEET_NAME_CONFIRM,
				data: {
					attend_time: $('input[name="attend_time"]:eq('+index+')').val(),
					phone: $('input[name="students"]:eq('+index+')').val(),
					subject: $('#subjectCode option:selected').val(),
					checker: '이희진'
				},
				success: function(data3) {
					console.log(l+1 + ' ' + $('input[name="students"]').val() + '님 출석확인 완료');
				},
				error: function() {
					alert('출석을 기록하는데 에러가 발생했습니다.');
				}
			});
		//}
		});
		alert('출석 확인이 완료되었습니다.');
		$('#checkAll').prop('checked', false);
		$('input[name="students"]').prop('checked',false);
		$('body').scrollTop(0);	// 페이지 맨 위로 이동
		$('.loading-container').fadeOut();
		$('#attendBtn').prop('disabled', false); // 버튼 활성화 복귀

	};

	$('#attendBtn').on('click', submitConfirm); 

	// --------------------------------------------------
	// 추가 작업 지시서
	// --------------------------------------------------
	// 1. 회비 납부
	// --------------------------------------------------
	var str = "";
	for(key in auth2) {
		str += key+"="+auth2[key]+"\n";
	}
	console.log(str);

	//if(gapi.auth2.getAuthInstance().isSignedIn.get()) {
		//$('#attendBtn').prop('disabled', false).prop('display','block');
	//	alert("!!@!@#");
	//}
});

  var clientId = '62990643006-squj2admavms41d94p4gkn3ef256dfn9.apps.googleusercontent.com';

  var authorizeButton = document.getElementById('authorize-button');
  var signoutButton = document.getElementById('signout-button');
  var profile = {};

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
          document.getElementById('gSignInWrapper').removeChild(document.getElementById('gSignInWrapper').firstChild);
        }
      }
      function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
      }
      function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
      }

	  // Load the API and make an API call.  Display the results on the screen.
      function makeApiCall() {
        if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
          profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
          var p = document.createElement('span');
          var name = profile.getName();
          var email = profile.getEmail();
          p.setAttribute('class', 'welcome');
          p.appendChild(document.createTextNode(name+'님 ('+email+') '));
          document.getElementById('gSignInWrapper').prepend(p);
        }
      }
    });
  }
