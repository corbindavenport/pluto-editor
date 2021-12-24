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

/* Global variables */

var globalFileHandle = null

var globalFileName = 'new.md'

/* File menu options */

document.querySelector('#new-file').addEventListener('click', function () {
    var editor = document.getElementById('pluto-editor')
    if (editor.textContent != '') {
        if (confirm('This will erase everything currently in the editor. Continue?')) {
            editor.innerHTML = ''
            updateFileName
            editor.focus()
        }
    }
})

if ('showDirectoryPicker' in window) {
    document.getElementById('save-file-as').style.display = 'block'
}

document.querySelector('#open-file').addEventListener('click', async function () {
    if ('showDirectoryPicker' in window) {
        // Pick file
        var pickerOpts = {
            types: [
                {
                    description: 'Markdown file',
                    accept: {
                        'text/markdown': ['.md']
                    }
                },
            ],
            excludeAcceptAllOption: true,
            multiple: false
        }
        globalFileHandle = await window.showOpenFilePicker(pickerOpts)[0]
        // Read file
        var file = await globalFileHandle.getFile()
        var text = await file.text()
        // Switch editor to file
        var converter = new showdown.Converter()
        var html = converter.makeHtml(text)
        document.getElementById('pluto-editor').innerHTML = html
        updateFileName(file.name, Boolean(false))
        updateWordCount()

    } else {
        // Use legacy file picker
        document.querySelector('#import').click()
    }
})

document.querySelector('#save-file').addEventListener('click', async function () {
    // Generate Markdown
    var converter = new showdown.Converter()
    var output = converter.makeMarkdown(document.getElementById('pluto-editor').innerHTML)
    var blob = new Blob([output], { type: 'text/markdown;charset=utf-8' })
    if (('showDirectoryPicker' in window) && (globalFileHandle != null)) {
        // Save file with File Access API 
        var writable = await globalFileHandle.createWritable()
        await writable.write(blob)
        await writable.close()
        updateFileName(globalFileName)
    } else {
        // Save file without File Access API
        alert('Your browser does not support the File Access API, so your changes will be saved as a new file in your Downloads folder.')
        saveAs(blob, globalFileName)
        updateFileName(globalFileName)
    }
})

document.querySelector('#save-file-as').addEventListener('click', async function () {
    // This option is only visible to browsers with the File Access API, so we don't need a fallback
    const options = {
        types: [
            {
                description: 'Markdown file',
                accept: {
                    'text/markdown': ['.md']
                }
            }
        ]
    }
    // Change file in editor to new file
    globalFileHandle = await window.showSaveFilePicker(options)
    updateFileName(globalFileHandle.name)
    // Convert to Markdown
    var converter = new showdown.Converter()
    var output = converter.makeMarkdown(document.getElementById('pluto-editor').innerHTML)
    var blob = new Blob([output], { type: 'text/markdown;charset=utf-8' })
    // Write changes to file
    var writable = await globalFileHandle.createWritable()
    await writable.write(blob)
    await writable.close()
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
    var reader = new FileReader()
    reader.onload = function () {
        var converter = new showdown.Converter()
        var html = converter.makeHtml(reader.result)
        document.getElementById('pluto-editor').innerHTML = html
        updateFileName(el.target.files[0].name, Boolean(false))
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
        updateFileName(globalFileName, new Boolean(true))
    })

updateWordCount()

/* File name updating */

function updateFileName(newglobalFileName, isModified = Boolean(false)) {
        if (newglobalFileName != globalFileName) {
            globalFileName = newglobalFileName
            document.title = newglobalFileName
            document.getElementById('pluto-file-name').innerText = newglobalFileName
        } else if (isModified) {
            document.title = globalFileName + '*'
            document.getElementById('pluto-file-name').innerText = newglobalFileName + '*'
        } else {
            document.title = globalFileName
            document.getElementById('pluto-file-name').innerText = newglobalFileName
        }
    }