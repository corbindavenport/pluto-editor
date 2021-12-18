function updateWordCount() {
    var wordCount = document.getElementById('pluto-editor').textContent.trim().split(/\s+/).length
    document.getElementById('pluto-word-count').innerText = wordCount
}

document.querySelector('#open-btn').addEventListener('click', function () {
    document.querySelector('#import').click()
})

document.querySelector('#import').addEventListener('change', function (el) {
    var file = el.target.files[0]
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

document.getElementById('pluto-editor').addEventListener('DOMCharacterDataModified', function() {
    updateWordCount()
})

updateWordCount()