var remote = require('remote');
var Menu = remote.require('menu');
var dialog = remote.require('dialog'); 
var fs = require('fs');





var template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open File (Left Pane)',
        accelerator: 'Command+L',
        click: function(){ fileopen(true); }
      },
      {
        label: 'Open File (Right Pane)',
        accelerator: 'Command+R',
        click: function(){ fileopen(false); }
      },
      {
        type: 'separator'
      },      
      {
        label: 'Save',
        accelerator: 'Command+S',
        click: filesave
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() {
            var window = remote.getCurrentWindow();
            window.close();            
        }
      },
    ]
  }
];

Menu.setApplicationMenu(Menu.buildFromTemplate(template));




function fileopen (left) {
 dialog.showOpenDialog(function (fileNames) {
  if (fileNames === undefined) return;
  var fileName = fileNames[0];
  fs.readFile(fileName, 'utf-8', function (err, data) {
    if (left) orig1 = data;
    else orig2 = data;
    initUI();
  });
 }); 
}

function filesave () {
  dialog.showSaveDialog(function (fileName) {
    if (fileName === undefined) return;
    fs.writeFile(fileName, value, function (err) {   
    });
  }); 
}


(function() {
    var throttle = function(type, name, obj) {
        var obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
            running = true;
            requestAnimationFrame(function() {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        };
        obj.addEventListener(type, func);
    };

    /* init - you can init any event */
    throttle("resize", "optimizedResize");
})();
window.addEventListener("optimizedResize",onWindowResize);

function onWindowResize() {
    var height = window.innerHeight;
    if (mergeView.leftOriginal()) mergeView.leftOriginal().setSize(null, height);
        mergeView.editor().setSize(null, height);
    if (mergeView.rightOriginal()) mergeView.rightOriginal().setSize(null, height);        
    mergeView.wrap.style.height = height + "px";        
}
    
var value, orig1, orig2, dv, panes = 3, highlight = true, connect = null, collapse = false, mergeView;    
function initUI() {
  if (value == null) return;
  var target = document.getElementById("view");
  target.innerHTML = "";
  mergeView = CodeMirror.MergeView(target, {
    value: value,
    origLeft: panes == 3 ? orig1 : null,
    orig: orig2,
    lineNumbers: true,
    mode: "text/html",
    highlightDifferences: highlight,
    connect: connect,
    collapseIdentical: collapse
  });
  onWindowResize();
}


function toggleDifferences() {
  dv.setShowDifferences(highlight = !highlight);
}

window.onload = function() {
  value = "";//document.documentElement.innerHTML;
  orig1 = "";// "<!doctype html>\n\n" + value.replace(/\.\.\//g, "codemirror/").replace("yellow", "orange");
  orig2 = "";//value.replace(/\u003cscript/g, "\u003cscript type=text/javascript ")
    //.replace("white", "purple;\n      font: comic sans;\n      text-decoration: underline;\n      height: 15em");
  initUI();
};

function mergeViewHeight(mergeView) {
  function editorHeight(editor) {
    if (!editor) return 0;
    return editor.getScrollInfo().height;
  }
  return Math.max(editorHeight(mergeView.leftOriginal()),
                  editorHeight(mergeView.editor()),
                  editorHeight(mergeView.rightOriginal()));
}

function resize(mergeView) {
  var height = mergeViewHeight(mergeView);
  for(;;) {
    if (mergeView.leftOriginal())
      mergeView.leftOriginal().setSize(null, height);
    mergeView.editor().setSize(null, height);
    if (mergeView.rightOriginal())
      mergeView.rightOriginal().setSize(null, height);

    var newHeight = mergeViewHeight(mergeView);
    if (newHeight >= height) break;
    else height = newHeight;
  }
  mergeView.wrap.style.height = height + "px";
}            



//---------

function fs_readfile_utf8( filepath, cb){
    fs.readFile(filepath, 'utf-8', function (err, data) { 
        if (err){
            fs.readFile(__dirname+'/'+filepath, 'utf-8', function (err, data) {
                if (err){ console.error( err ); }
                else { cb(data); }
            })
        }
        else cb(data);
    });
}


var argv = remote.process.argv.slice(2);
if (argv){
    if (argv.length > 0)
        fs_readfile_utf8(argv[0], function(data){ orig1 = data; initUI()});
                
    if (argv.length > 1)
        fs_readfile_utf8(argv[1], function(data){ orig2 = data; initUI()});            
}
else initUI();

// -------------------------------------------------------------------