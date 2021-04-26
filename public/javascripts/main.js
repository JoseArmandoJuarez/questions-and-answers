
var length = 65;
var text = document.querySelectorAll('.questionTrunc');


for(var i = 0; i < text.length; i++){
    var truncText = text[i].innerText;
    var myTruncatedString = truncText.substring(0,length) + '...';
    console.log(myTruncatedString)
    text[i].innerText = myTruncatedString;
}


function toggleAnswerForm(){
    var btn = document.getElementById('add-answer');
    var text = btn.innerText;
    
    if(text === 'Add an answer'){
        document.querySelector('.answer-form').style.display = 'block';
        btn.style.display = 'none';
    }
}

function cancelAnswerForm(){
    var btn = document.getElementById('add-answer');
    var cancelBtn = document.getElementById('cancel-answer');
    
    if(cancelBtn.value === 'Cancel'){
        document.querySelector('.answer-form').style.display = 'none';
        btn.style.display = 'block';
    }
}