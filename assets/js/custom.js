// 음악 파일 리스트
let musicList = new Array();
// 데이터 파일
let metadataFile = null;
let modelFile = null;
let weightsFile = null;
// 파일 고유번호
let musicFileIndex = 0;
// 카메라 시작 버튼
let cameraEle = document.getElementById('camera');
let dataDropZone = document.getElementById('dataDropZone');
let musicDropZone = document.getElementById('musicDropZone');

// TODO 슬라이더 추가하고 연속재생을 단일재생할지, pause할지 stop할지 정하고 그렇게 만드는 코드 넣기
$(function() {
    // 파일 드롭 다운
    fileDropDown();
});

// 파일 드롭 다운
function fileDropDown(){
    var dropZone = $(".dropZone");

    dropZone.on('dragenter',function(e){ //드래그 해서 마우스가 올려진 순간
        e.stopPropagation();
        e.preventDefault();
        // css 스타일 변경
        $(event.target).css('background-color','#ebccff');
    });
    dropZone.on('dragleave',function(e){ //마우스가 올려졌다가 빠졌을 때
        e.stopPropagation();
        e.preventDefault();

        $(event.target).css('background-color','#f5e6ff');
    });
    dropZone.on('dragover',function(e){ //마우스를 올려놓고 유지하고 있는 상태
        e.stopPropagation();
        e.preventDefault();
    });
    dropZone.on('drop',function(e){ //파일을 떨어뜨렸을 때
        e.preventDefault();

        $(event.target).css('background-color','#f5e6ff');

        var files = e.originalEvent.dataTransfer.files;
        if(files != null){
            if(files.length < 1){
                alert("폴더 업로드 불가");
                return;
            }
            selectFile(files, e)
        }else{
            alert("ERROR");
        }
    });
}

// 파일 선택시
function selectFile(files, e){
    // 다중파일 등록
    if(files != null){
        for(let i = 0; i < files.length; i++){
            // 파일 이름
            var fileName = files[i].name;
            var fileNameArr = fileName.split("\.");
            // 확장자
            var ext = fileNameArr[fileNameArr.length - 1];

            // 드롭 박스에 따라 각각의 테이블에 목록 생성 및 파일 저장
            if ($(e.target).attr("id") == "musicDropZone") {
                if ($.inArray(ext, ['mp3', 'mp4', 'wav', 'm4a']) >= 0) {
                    // 음악 파일 저장
                    musicList[musicFileIndex] = [new Audio(URL.createObjectURL(files[i])), fileName];

                    // 음악 파일 목록 생성
                    addFileList(musicFileIndex, fileName, e);

                    // 음악 파일 번호 증가
                    musicFileIndex++;
                }else{
                    alert("확장자가 'mp3', 'mp4', 'wav', 'm4a'인 음악 파일만 가능합니다.");
                }

            }else if ($(e.target).attr("id") == "dataDropZone") {
                if (fileName == 'metadata.json') {
                  // 메타 데이터 파일 저장 및 목록 생성
                  if (metadataFile == null) {
                      metadataFile = files[i];
                      addFileList(0, fileName, e);
                  }else{  // 이미 존재하면 알림 생성
                      alert("metadata.json 파일은 이미 등록되어있습니다.");
                  }

                }else if (fileName == 'model.json') {
                    // 모델 파일 저장 및 목록 생성
                    if (modelFile == null) {
                        modelFile = files[i];
                        addFileList(1, fileName, e);
                    }else{
                        alert("model.json 파일은 이미 등록되어있습니다.");
                    }

                }else if (fileName == 'weights.bin') {
                    // 모델 파일 저장 및 목록 생성
                    if (weightsFile == null) {
                        weightsFile = files[i];
                        addFileList(2, fileName, e);
                    }else{
                        alert("weights.bin 파일은 이미 등록되어있습니다.");
                    }

                }else {
                    alert("metadata.json, model.json, weights.bin 파일만 등록 가능합니다.");
                }

            }else{
                // 확장자 체크
                alert("에러!");
                break;
            }
        }
    }else{
        alert("ERROR");
    }
}

// 업로드 파일 목록 생성
function addFileList(fileIndex, fileName, e){
    var html = "";

    if ($(e.target).attr("id") == "musicDropZone"){
      html += "<tr id='musicFileTr_" + fileIndex + "'>";
    }else{  //"dataDropZone"
      html += "<tr id='dataFileTr_" + fileIndex + "'>";
    }

    html += "    <th class='py-1'>";

    if ($(e.target).attr("id") == "musicDropZone"){
      html += fileName + "<a href='#' onclick='deleteMusicFile(" + fileIndex + "); return false;' class='btn text-danger py-0'>삭제</a>"
    }else{  //"dataDropZone"
      html += fileName + "<a href='#' onclick='deleteDataFile(" + fileIndex + "); return false;' class='btn text-danger py-0'>삭제</a>"
    }

    html += "    </th>"
    html += "</tr>"

    if ($(e.target).attr("id") == "musicDropZone"){
      $('#musicFileTable').append(html);
    }else{  //"dataDropZone"
      $('#dataFileTable').append(html);
    }

    // dropzone과 카메라 버튼의 타이틀 수정
    changeTitle()
}

// 음악 파일 삭제
function deleteMusicFile(fIndex){
    // 음악 파일 배열에서 삭제
    musicList.splice(fIndex, 1);

    // 음악 파일 테이블 목록에서 삭제
    $("#musicFileTr_" + fIndex).remove();

    // 인덱스 낮추기
    musicFileIndex--;

    // dropzone과 카메라 버튼의 타이틀 수정
    changeTitle()
}

// 데이터 파일 삭제
function deleteDataFile(fIndex){
    // 데이터 파일 삭제
    if (fIndex == 0) {
        metadataFile = null;
    }else if (fIndex == 1) {
        modelFile = null;
    }else if (fIndex == 2) {
        weightsFile = null;
    }

    // 데이터 파일 테이블 목록에서 삭제
    $("#dataFileTr_" + fIndex).remove();

    // dropzone과 카메라 버튼의 타이틀 수정
    changeTitle()
}

function changeTitle(){
  if (metadataFile == null) {
    cameraEle.title = "metadata.json 파일을 등록해 주세요!";
    cameraEle.disabled = true;
  }else if (modelFile == null) {
    cameraEle.title = "model.json 파일을 등록해 주세요!";
    cameraEle.disabled = true;
  }else if (weightsFile == null) {
    cameraEle.title = "weights.bin 파일을 등록해 주세요!";
    cameraEle.disabled = true;
  }else {
    cameraEle.title = "음악 파일을 모델의 분류 수와 맞게 넣지 않으면 문제가 있을 수 있습니다.\n모르겠다면 그냥 해보세요.";
    cameraEle.disabled = false;
  }
}

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
let model, webcam, ctx, labelContainer, maxPredictions, pairNumbers;

async function init() {
    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)

    // url이 아닌 파일로 열기 위해서 함수를 loadFromFiles로 바꿈
    model = await tmPose.loadFromFiles(modelFile, weightsFile, metadataFile);
    maxPredictions = model.getTotalClasses();
    pairNumbers = Math.min(maxPredictions, musicList.length);

    // Convenience function to setup a webcam
    const size = 400;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = size; canvas.height = size;
    ctx = canvas.getContext("2d");

    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < pairNumbers; i++) { // and class labels
        labelContainer.appendChild(document.createElement("h5"));
    }

    $("#camera").hide();
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {

    function get_type(){
      for (let i = 0; i < pairNumbers; i++){
        if (prediction[i].probability.toFixed(2) >= 0.5){
          return i
        }
      }
      return -1
    }

    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    type = get_type()

    for (let i = 0; i < pairNumbers; i++){
      // 음악을 아예 정지하는 함수는 없다. 대신 현재 재생 위치를 0으로 하는 코드를 넣으면 된다.
      musicList[i][0].pause();
      labelContainer.childNodes[i].style.color = "#000000";
    }

    for (let i = 0; i < pairNumbers; i++) {
        let classPrediction = (i+1) + ". " + prediction[i].className;
        if (i < musicList.length) {
          classPrediction += "(" + musicList[i][1] + ")";
        }
        classPrediction += ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    if (type != -1 && type < musicList.length){
      musicList[type][0].play();
      labelContainer.childNodes[type].style.color = "#7a00cc";
    }

    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    if (webcam.canvas) {
        ctx.drawImage(webcam.canvas, 0, 0);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}
