function getSelectedText() {
    // Get text selection
    var textEl = window.getSelection()
    console.log('Text selection:', textEl)
    // Ensure only the editor area can be modified
    if (!document.getElementById('pluto-editor').contains(textEl.focusNode)) {
        console.error('Selection area is outside editor.')
        return null
    }
    var selectedString = textEl.focusNode.data.slice(textEl.anchorOffset, textEl.focusOffset)
    // Return data
    var data = {
        'node': textEl,
        'parentNode': textEl.focusNode.parentNode,
        'selected': selectedString
    }
    return data
}

/* Global variables */

var globalEditor = document.getElementById('pluto-editor')

var globalFileHandle = null

var globalFileName = 'text.md'

/* File menu options and functions */

async function openFile(file, fileName=null) {
    // Prompt user that they will lose changes
    if (globalEditor.textContent != '') {
        if (confirm('Your unsaved changes will be lost. Do you want to continue?')) {
            // Do nothing
        } else {
            return
        }
    }
    // Read the file
    if (typeof file === 'string') {
        // This is from the clipboard
        var text = file
        updateFileName('text.md', Boolean(false))
    } else if ('kind' in file) {
        // This is a File Handler object for the File System APO
        globalFileHandle = file
        var data = await globalFileHandle.getFile()
        var text = await data.text()
        updateFileName(data.name, Boolean(false))
    } else if ('result' in file) {
        // This is a legacy file from the <input> picker
        var text = file.result
        updateFileName(fileName, Boolean(false))
    }
    // Switch editor to file
    var converter = new showdown.Converter()
    var html = converter.makeHtml(text)
    document.getElementById('pluto-editor').innerHTML = html
    updateWordCount()
}

document.querySelector('#new-file').addEventListener('click', function () {
    if (globalEditor.textContent != '') {
        if (confirm('Your unsaved changes will be lost. Do you want to continue?')) {
            editor.innerHTML = ''
            updateFileName('text.md')
            globalFileHandle = null
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
        var picker = await window.showOpenFilePicker(pickerOpts)
        var fileData = picker[0]
        openFile(fileData)

    } else {
        // Use legacy file picker
        document.querySelector('#import').click()
    }
})

document.querySelector('#open-clipboard').addEventListener('click', async function () {
    var clipText = await navigator.clipboard.readText()
    openFile(clipText)
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
        if (!('showDirectoryPicker' in window)) {
            alert('Your browser does not support the File Access API, so your changes will be saved as a new file in your Downloads folder.')
        }
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

document.querySelector('#save-clipboard').addEventListener('click', async function () {
    // Convert to Markdown
    var converter = new showdown.Converter()
    var output = converter.makeMarkdown(document.getElementById('pluto-editor').innerHTML)
    // Write to clipboard
    navigator.clipboard.writeText(output).then(function () {
        alert('The Markdown version has been copied to your clipboard!')
    }, function () {
        alert('There was an error, sorry!')
    })
})

document.querySelector('#import').addEventListener('change', function (el) {
    var file = el.target.files[0]
    var reader = new FileReader()
    reader.onload = function () {
        openFile(reader, file.name)
    }
    reader.onerror = function (event) {
        alert('Error: ' + event)
    }
    reader.readAsText(file)
})

/* Editor buttons */

document.querySelector('#pluto-editor-bold').addEventListener('click', function () {
    document.execCommand('bold')
})

document.querySelector('#pluto-editor-italic').addEventListener('click', function () {
    document.execCommand('italic')
})

document.querySelectorAll('.pluto-editor-header-btn').forEach(function (el) {
    el.addEventListener('click', function () {
        var tag = 'h' + el.dataset.size
        var text = getSelectedText()
        // Create header element
        var headEl = document.createElement(tag)
        headEl.innerText = text.parentNode.innerText
        text.parentNode.parentNode.replaceChild(headEl, text.parentNode)
    })
})

document.querySelector('#pluto-editor-paragraph-btn').addEventListener('click', function () {
    var text = getSelectedText()
    // Create paragraph element
    var pEl = document.createElement('p')
    pEl.innerText = text.parentNode.innerText
    text.parentNode.parentNode.replaceChild(pEl, text.parentNode)
})

document.querySelectorAll('button, .dropdown-item').forEach(function (el) {
    el.addEventListener('mousedown', function (e) {
        e.preventDefault()
    }, false)
})

document.querySelector('#pluto-editor-about').addEventListener('click', function () {
    window.open('https://github.com/corbindavenport/pluto-editor', '_blank')
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

/* File Handling API support */

/*
if ('launchQueue' in window && 'files' in LaunchParams.prototype) {
    launchQueue.setConsumer((launchParams) => {
      // Nothing to do when the queue is empty.
      if (!launchParams.files.length) {
        return;
      }
      for (const fileHandle of launchParams.files) {
        // Read file
        globalFileHandle = launchParams.files[0]
        var file = await globalFileHandle.getFile()
        var text = await file.text()
        // Switch editor to file
        var converter = new showdown.Converter()
        var html = converter.makeHtml(text)
        document.getElementById('pluto-editor').innerHTML = html
        updateFileName(file.name, Boolean(false))
        updateWordCount()
      }
    });
  }
  */