// 파일 리스트 번호
var fileIndex = -1;
// 파일 리스트
var fileList = new Array();

$(function() {
    // 파일 드롭 다운
    fileDropDown();
});

// 파일 드롭 다운
function fileDropDown(){
    var dropZone = $(".dropZone");
    // var dropZone = document.getElementsByClassName("dropZone");

    dropZone.on('dragenter',function(e){ //드래그 해서 마우스가 올려진 순간
        e.stopPropagation();
        e.preventDefault();
    });
    dropZone.on('dragleave',function(e){ //마우스가 올려졌다가 빠졌을 때
        e.stopPropagation();
        e.preventDefault();
    });
    dropZone.on('dragover',function(e){ //마우스를 올려놓고 유지하고 있는 상태
        e.stopPropagation();
        e.preventDefault();
    });
    dropZone.on('drop',function(e){ //파일을 떨어뜨렸을 때
        e.preventDefault();

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
        for(var i = 0; i < files.length; i++){
            // 파일 이름
            var fileName = files[i].name;
            var fileNameArr = fileName.split("\.");
            // 확장자
            var ext = fileNameArr[fileNameArr.length - 1];

            if (($(e.target).attr("id") == "musicDropZone" && $.inArray(ext, ['mp3', 'mp4', 'wav']) >= 0)
          || ($(e.target).attr("id") == "dataDropZone" && $.inArray(ext, ['json']) >= 0)) {
                // 파일 번호 증가
                fileIndex++;

                // 파일 배열에 넣기
                fileList[fileIndex] = files[i];

                // 업로드 파일 목록 생성
                addFileList(fileIndex, fileName, e);
            }else{
                // 확장자 체크
                alert("등록 불가 확장자");
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
    html += "<tr id='fileTr_" + fileIndex + "'>";
    html += "    <th class='py-1'>";
    html +=         fileName + "<a href='#' onclick='deleteFile(" + fileIndex + "); return false;' class='btn text-danger py-0'>삭제</a>"
    html += "    </th>"
    html += "</tr>"

    if ($(e.target).attr("id") == "musicDropZone"){
      $('#musicFileTable').append(html);
    }else{  //"dataDropZone"
      $('#dataFileTable').append(html);
    }

}

// 업로드 파일 삭제
function deleteFile(fIndex){

    // 파일 배열에서 삭제
    delete fileList[fIndex];

    // 업로드 파일 테이블 목록에서 삭제
    $("#fileTr_" + fIndex).remove();
}

// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/pose

// the link to your model provided by Teachable Machine export panel
const URL = "./my_model/";
let model, webcam, ctx, labelContainer, maxPredictions, audio_list;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const size = 200;
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
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
  // TODO $(".dropZone")
    const audio_list = [document.getElementById('audio_do'),
                        document.getElementById('audio_re')];

    function get_type(){
      for (let i = 0; i < maxPredictions; i++){
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
    if (type == -1){
      for (let i = 0; i < maxPredictions; i++){
        audio_list[i].pause();
      }
    }else{
      // const classPrediction =
      //   prediction[type].className + ": " + prediction[type].probability.toFixed(2);
      // labelContainer.childNodes[0].innerHTML = classPrediction;

      audio_list[type].play();
      for (let i = 0; i < maxPredictions; i++){
        if (type == i) continue;
        audio_list[i].pause();
      }
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
