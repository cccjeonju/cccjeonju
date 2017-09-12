jQuery(function($){
	$(function() {
		$("#checkId").click(function() {
			$.ajax({
				dataType: 'jsonp',
				jsonp: 'jsonCallback',
				url: 'https://docs.google.com/spreadsheets/d/1PHN8N0nY7YLw5NlYTp9VqSvqOHdgsvR2W8BfAZ8AtY4/gviz/tq'
			}).done(function (data) {
				var list = JSON.parse(data.substring(data.indexOf('(')+1, data.indexOf(');'))).table.rows, // 문자열에서 불필요한 부분 제거하고 JSON 형식으로.
					sum = list.length; // 목록 수.
				console.log('* SHEET DATA URL - https://goo.gl/Vvge1E'); // 구글 스프레드시트 URL.
				//console.log(data);
				//console.log(list);
				console.log('* 식당 수: ' + sum + '곳');
				for (var i = 0; i < sum; i++) { // 전체 식당 목록을 콘솔에 출력.
					console.log(i+1 + '. ' + list[i].c[1].v + ' - ' + list[i].c[2].v);
				}
				$('.loading-container').fadeOut(); // 로딩바 제거.
				$('.count').text( sum + '곳' ); // 식당 수 표시.
				var recommend = function(){ // 랜덤 추천.
					var	num = parseInt(Math.random()*sum); // 난수 생성.
					$('output>a').text(list[num].c[1].v).attr('href', list[num].c[2].v); // 식당 출력하고 링크 걸기.
				};
				$('button').on('click', recommend); // 밥 먹으러 갈까요?
			}).fail(function () {
				alert('아이쿠! 데이터 불러오기 실패. 아마도 jQuery CDN 또는 일시적인 구글 API 문제. ㅜㅜ;');
			});

		});
	})
});

function jsonCallback(json) {
	console.log(json);
}