function getSelectedText() {
    // Get text selection
    var textEl = window.getSelection()
    console.log(textEl)
    if (textEl.type != 'Range') {
        console.log('No text selected')
        return null
    }
    var selectedString = textEl.focusNode.data.slice(textEl.anchorOffset, textEl.focusOffset)
    // Return data
    var data = {
        'node': textEl,
        'parent': textEl.focusNode.parentNode,
        'selected': selectedString
    }
    return data
}

/* File menu options */

document.querySelector('#new-file').addEventListener('click', function () {
    var editor = document.getElementById('pluto-editor')
    if (editor.textContent != '') {
        if (confirm('This will erase everything currently in the editor. Continue?')) {
            editor.innerHTML = ''
            document.title = 'untitled.md'
            editor.dataset.filename = 'untitled.md'
            editor.focus()
        }
    }
})

document.querySelector('#open-file').addEventListener('click', function () {
    document.querySelector('#import').click()
})

document.querySelector('#save-file').addEventListener('click', function () {
    // Generate Markdown
    var fileName = document.getElementById('pluto-editor').dataset.filename
    var converter = new showdown.Converter()
    var output = converter.makeMarkdown(document.getElementById('pluto-editor').innerHTML)
    // Save file
    var blob = new Blob([output], { type: 'text/markdown;charset=utf-8' })
    saveAs(blob, fileName)
})

/* Editor buttons */

document.querySelector('#pluto-editor-bold').addEventListener('click', function () {
    document.execCommand('bold')
})

document.querySelector('#pluto-editor-italic').addEventListener('click', function () {
    document.execCommand('italic')
})

document.querySelector('#import').addEventListener('change', function (el) {
    var file = el.target.files[0]
    document.title = el.target.files[0].name
    document.getElementById('pluto-editor').dataset.filename = el.target.files[0].name
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

/* Word count updating */

function updateWordCount() {
    // Update word count
    var wordCount = document.getElementById('pluto-editor').textContent.trim().split(/\s+/).length
    document.getElementById('pluto-word-count').innerText = wordCount
    // Update character count
    var wordCount = document.getElementById('pluto-editor').textContent.trim().length
    document.getElementById('pluto-char-count').innerText = wordCount
}

document.getElementById('pluto-editor').addEventListener('DOMCharacterDataModified', function () {
    updateWordCount()
})

updateWordCount()