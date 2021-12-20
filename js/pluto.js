function updateWordCount() {
    // Update word count
    var wordCount = document.getElementById('pluto-editor').textContent.trim().split(/\s+/).length
    document.getElementById('pluto-word-count').innerText = wordCount
    // Update character count
    var wordCount = document.getElementById('pluto-editor').textContent.trim().length
    document.getElementById('pluto-char-count').innerText = wordCount
}

document.querySelector('#open-file').addEventListener('click', function () {
    document.querySelector('#import').click()
})

document.querySelector('#pluto-editor-bold').addEventListener('click', function () {
    var textEl = window.getSelection()
    console.log(textEl)
    var textContent = textEl.focusNode.data
    textEl.focusNode.parentNode.innerHTML = textEl.focusNode.parentNode.innerHTML.replace(textContent, '<b>' + textContent + '</b>')
})

document.querySelector('#import').addEventListener('change', function (el) {
    var file = el.target.files[0]
    document.title = el.target.files[0].name
    var reader = new FileReader()
    reader.onload = function () {
        var converter = new showdown.Converter()
        var html = converter.makeHtml(reader.result)
        document.getElementById('pluto-editor').innerHTML = html
        updateWordCount()
    }
    reader.onerror = function (event) {
        alert('Error: ' + event)
    }
    reader.readAsText(file)
})

document.getElementById('pluto-editor').addEventListener('DOMCharacterDataModified', function () {
    updateWordCount()
})

updateWordCount()