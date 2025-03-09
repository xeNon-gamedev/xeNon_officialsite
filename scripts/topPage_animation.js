document.addEventListener("DOMContentLoaded", async function () {
  let contents_page_2_data

  const db_data = await fetchJsonFile("news/content_db.xnfd");

  const max_db_files = db_data.max_db_files

  const fileContent = await fetchJsonFile("news/contents_"+max_db_files+".xnfd");

  if (( fileContent.length < 5 ) && ( max_db_files > 1 )){
    contents_page_2_data = await fetchJsonFile("news/contents_"+String(Number( max_db_files - 1 ))+".xnfd");
  } else {
    contents_page_2_data = "none"
  }

  if ((fileContent.length != 0) && (fileContent != null)){
    document.getElementById('news_list').innerHTML = ""

    dedicated_data_processing(fileContent, contents_page_2_data);
  }

}, false);


//スクロール時のイベントを追加
window.addEventListener('scroll', function(){

    const item_x = document.querySelectorAll('.item_x');
    const item_y = document.querySelectorAll('.item_y');
    item_animation(item_x, item_y);

    news_animation();

    news_list_animation();

});

function news_animation(){
    var   scrolled = window.scrollY
    const display_height = window.innerHeight - 600
    const news_title_b = document.querySelectorAll('.news_title');
    const news_title_sub = document.querySelectorAll('.news_title_sub');

    if (scrolled > display_height){
        news_title_b[0].classList.add("-visible")
        news_title_sub[0].classList.add("-visible")
    }
}

function item_animation(item_x, item_y){

    //X軸のアニメーション専用
    for(let i = 0; i < item_x.length; i++){

      //.itemのオフセットの高さを取得
        var targetTop = item_x[i].offsetTop;

      //画面のスクロール量 + 300px > .itemのオフセットの高さを取得
        if(window.scrollY + 700 > targetTop){
        
        //各itemにクラスshowを追加
        item_x[i].classList.add('show');
        }
    }

    //Y軸のアニメーション専用
    for(let i = 0; i < item_y.length; i++){

      //.itemのオフセットの高さを取得
        var targetTop = item_y[i].offsetTop;

      //画面のスクロール量 + 300px > .itemのオフセットの高さを取得
        if(window.scrollY + 700 > targetTop){
        
        //各itemにクラスshowを追加
        item_y[i].classList.add('show');
        }
    } 
}

function sleep(msec) {
  return new Promise(function(resolve) {

    setTimeout(function() {resolve()}, msec);

  })
}

async function news_list_animation(){
  const news_items = document.querySelectorAll('.item_news');
  var targetTop = news_items[0].offsetTop;

    if(window.scrollY - 600 > targetTop){
      for(let i = 0; i < news_items.length; i++){
        var targetTop = news_items[i].offsetTop;
        //各itemにクラスshowを追加
        news_items[i].classList.add('show');
        await sleep(50);
      }
    }
}

async function fetchJsonFile(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json(); // JSONデータを取得
  } catch (error) {
      console.error("Error fetching JSON file:", error);
      return null;
  }
}

function dedicated_data_processing(json_data, contents_page_2_data){
  let news_field_list = ""
  let date_pre_processed
  let date_processed

  for(let processed = 0; processed < json_data.length; processed++){
    if (processed == 5){
      break
    }
    //dbから取得するデータを降順に置き換える
    var processed_reciprocal = json_data.length - processed - 1
    //jsonの-で表記された日付をわかりやすくする
    date_pre_processed = (json_data[processed_reciprocal].date).split("-")
    date_processed = date_pre_processed[0]+"."+date_pre_processed[1]+"."+date_pre_processed[2]
    
    //表示用データに書き込み
    news_field_list = news_field_list + "<li class='item_news'><a href='"+json_data[processed_reciprocal].url+"' class='news_story'><time datetime='"+json_data[processed_reciprocal].date+"'>"+date_processed+"</time><p class='post_title'>"+json_data[processed_reciprocal].title+"</p></a></li>"
  }

  if ( contents_page_2_data != "none" ){
    for(let processed = 9; processed > 4 + json_data.length; processed--){
      //jsonの-で表記された日付をわかりやすくする
      date_pre_processed = (contents_page_2_data[processed].date).split("-")
      date_processed = date_pre_processed[0]+"."+date_pre_processed[1]+"."+date_pre_processed[2]

      //表示用データに書き込み
      news_field_list = news_field_list + "<li class='item_news'><a href='"+contents_page_2_data[processed].url+"' class='news_story'><time datetime='"+contents_page_2_data[processed].date+"'>"+date_processed+"</time><p class='post_title'>"+contents_page_2_data[processed].title+"</p></a></li>"
    }
  }

  //反映
  document.getElementById('news_list').innerHTML = news_field_list

}
