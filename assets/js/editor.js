
const theme = () => {
  const theme = (window.localStorage.getItem('theme') ?? 'light') == 'light' ? 'light' : 'dark';
  const toggle_theme = document.querySelector('#toggle-theme');
  document.querySelector('html').setAttribute('theme', theme);
  toggle_theme.onclick = ev => {
    const theme = (window.localStorage.getItem('theme') ?? 'light') == 'dark' ? 'light' : 'dark';
    document.querySelector('html').setAttribute('theme', theme);
    window.localStorage.setItem('theme', theme);
  };
};

const choose_template_item = () => {
  const open_btn = document.getElementById('choose-item-menu');
  const close_box = document.getElementById('choose-item-cover');
  const box = document.getElementById('choose-item');
  open_btn.onclick = ev => box.classList.toggle('active');
  close_box.onclick = ev => box.classList.remove('active');

  var items = new Object();

  items["item-headings"] = `
# A first-level heading\n
## A second-level heading\n
### A third-level heading
`;

  items["item-paragraphs"] = "You can create a new paragraph by leaving a blank line between lines of text.";
  items["item-hr"] = "---";

  items["item-stylingtext"] = `
Bold: **This is bold text** or __This is bold text__\n
Italic: *This text is italicized* or _This text is italicized_\n
All bold and italic: ***All this text is important***\n
Bold and nested italic: **This text is _extremely_ important**\n
Strikethrough: ~~This was mistaken text~~\n
Underline: This is an <ins>underlined</ins> text\n
Subscript: This is a <sub>subscript</sub> text\n
Supscript: This is a <sup>superscript</sup> text
`;

  items["item-quotingtext"] = `
Text that is not a quote\n
> Text that is a quote
`;

  items["item-quotingcode"] = "\
Use `git status` to list all new or modified files that haven't yet been committed.\n\
\n\
Some basic Git commands are:\n\
```bash\n\
git status\n\
git add\n\
git commit\n\
```";

  items["item-links"] = `
Linked text: This site was built using [GitHub Pages](https://pages.github.com/).\n
Normal link: https://github.com/hctilg/md-editor
`;

  items["item-images"] = "\
You can display an image by adding `!` and wrapping the alt text in `[ ]`. Alt text is a short text equivalent of the information in the image. Then, wrap the link for the image in parentheses `()`.\n\n\
![A kitten is a juvenile cat.](https://hctilg.github.io/md-editor/assets/images/nokia-n900-mahi.jpg)\
";

  items["item-table"] = `
## Tables 

| Month | Savings |
| -------- | ------- |
| January | $250 |
| February | $80 |
| March | $420 |

### Text Alignment

Align text in the columns to the left, right, or center by adding a colon \`:\` to the left, right, or on both side of the dashes \`---\` within the header row.

| Item              | In Stock | Price |
| :---------------- | :------: | ----: |
| Arch Linux Hat    |   True   | 23.99 |
| Redis Book        |   True   | 23.99 |
| Coffee Mug        |   False  | 19.99 |
| OpenSource Hoodie |   False  | 42.99 |

+  :-- means the column is left aligned.
+  --: means the column is right aligned.
+  :-: means the column is center aligned.
`;

  items["item-lists"] = `
You can make an unordered list by preceding one or more lines of text with \`-\`, \`*\`, or \`+\`.

- George Washington
+ Thomas Jefferson
* John Adams

To order your list, precede each line with a number.

1. James Madison
2. James Monroe
3. John Quincy Adams

You can create a nested list by indenting one or more list items below another item.

1. First list item
   - First nested list item
     - Second nested list item

`;

  items["item-tasklists"] = `
To create a task list, preface list items with a hyphen and space followed by \`[ ]\`. To mark a task as complete, use \`[x]\`.

- [x] task 1
- [ ] task 2
- [ ] task 3

If a task list item description begins with a parenthesis, you'll need to escape it with \`\\\`:

\`- [ ] \\(Optional) Open a followup issue\`
`;

  items["item-imdf"] = `
You can ignore Markdown formatting by using \`\\\` before the Markdown character.

\`Let's rename \\*our-new-project\\* to \\*our-old-project\\*.\`
`;

  for (const [item_id, plain_text] of Object.entries(items)) {
    document.getElementById(item_id).onclick = (ev => {
      var raw = document.getElementById('raw');
      raw.value += `\n${plain_text.trim()}\n`;
      raw.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 13 }));
      box.classList.remove('active');
    });
  }
};

const extensions_loader = () => {
  showdown.extension('commenter', converter => {
    var matches = [];
    return [
      { 
        type: 'lang',
        regex: /%start%([^]+?)%end%/gi,
        replace: (s, match) => { 
          matches.push(match);
          var n = matches.length - 1;
          return '%PLACEHOLDER' + n + '%';
        }
      }, {
        type: 'output',
        filter: text => {
          for (var i=0; i< matches.length; ++i) {
            var pat = '<p>%PLACEHOLDER' + i + '% *<\/p>';
            text = text.replace(new RegExp(pat, 'gi'), matches[i]);
          }
          matches = [];
          return text;
        }
      }
    ];
  });

  const classMap = {
    h1: 'ui large header',
    h2: 'ui medium header',
    ul: 'ui list',
    li: 'ui item'
  }

  showdown.extension('bindings', Object.keys(classMap).map(key => ({
    type: 'output',
    regex: new RegExp(`<${key}(.*)>`, 'g'),
    replace: `<${key} class="${classMap[key]}" $1>`
  })));
  
};

const converter_data = (readme, dump=true, title='HTML Page', description='Generated By https://github.com/hctilg/md-editor') => {

  converter = new showdown.Converter({
    extensions: ['bindings', 'commenter'],
    requireSpaceBeforeHeadingText: true,
    ghCompatibleHeaderId: true,
    headerLevelStart: 1,
    noHeaderId: false,
    ghCodeBlocks: true,
    tasklists: true,
    encodeEmails: true,
    simplifiedAutoLink: true,
    tables: true,
    ghMentions: true,
    ghMentionsLink: true,
    disableForced4SpacesIndentedSublists: false,
    strikethrough: true,
    simpleLineBreaks: false,
    smoothPreview: true,
    emojis: true,
  });
  
  body = converter.makeHtml(readme);

  html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
    <meta http-equiv="content-language" content="en">
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <link rel="stylesheet" href="https://hctilg.github.io/md-editor/assets/css/markdown.css" />
  </head>
  <body>${body}</body>
</html>
`;

  return dump ? html : body;
};

const editor = () => {
  const raw = document.getElementById('raw');
  const reset = document.getElementById('reset');
  const preview = document.getElementById('preview-template');
  extensions_loader();
  raw.onkeyup = ev => {
    let readme = (ev.srcElement || ev.target).value;
    preview.srcdoc = converter_data(readme);
  };
  raw.onselectstart = ev => console.log(ev);
  raw.onselectionchange = ev => console.log(ev);
  raw.onselect = ev => console.log(ev);
  preview.srcdoc = converter_data(raw.value);
  reset.onclick = ev => raw.value = preview.srcdoc = '';
};

const download_haandler = () => {
  const download_btn = document.getElementById('download_btn');
  download_btn.onclick = ev => {
    var dl_model_box = document.createElement('div');
    dl_model_box.id = "download_haandler";

    var p = document.createElement('p');
    p.innerText = "Select the output format";
    p.classList.add('question');
    dl_model_box.appendChild(p);

    var bb = document.createElement('div');
    bb.classList.add('btn_box');

    var btn_md = document.createElement('button');
    btn_md.id = "download_md";
    btn_md.classList.add('mui-btn');
    btn_md.classList.add('mui-btn--primary');
    btn_md.innerText = "Download Markdown File";
    btn_md.onclick = ev => {
      markdown_download_handler();
      document.getElementById('mui-overlay').click();
    };
    bb.appendChild(btn_md);

    var btn_html = document.createElement('button');
    btn_html.id = "download_html";
    btn_html.classList.add('mui-btn');
    btn_html.classList.add('mui-btn--primary');
    btn_html.innerText = "Download HTML Page";
    btn_html.onclick = ev => {
      html_download_handler();
      document.getElementById('mui-overlay').click();
    };
    bb.appendChild(btn_html);

    var btn_pdf = document.createElement('button');
    btn_pdf.id = "download_pdf";
    btn_pdf.classList.add('mui-btn');
    btn_pdf.classList.add('mui-btn--primary');
    btn_pdf.innerText = "Download PDF";
    btn_pdf.onclick = ev => {
      document.getElementById('mui-overlay').click();
      pdf_download_handler();
    };
    bb.appendChild(btn_pdf);

    dl_model_box.appendChild(bb);

    mui.overlay('on', dl_model_box);
  };

};

const getBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const createTextFile = (path, content, mimetype = "text/plain;charset=utf-8") => {
  const blob = new Blob([content], { type: mimetype });
  return new File([blob], path, {
    lastModified: new Date().getTime(),
    type: blob.type
  });
}

const downoladURL = (path, url) => {
  const download_link = document.createElement('a');
  download_link.style.display = 'none';
  download_link.href = url;
  download_link.download = path;
  document.body.appendChild(download_link);
  download_link.click();
};

const markdown_download_handler = () => {
  var content = document.getElementById('raw').value;
  var file_name = `readme.md`;
  var md_file = createTextFile(file_name, content, "text/markdown;charset=utf-8");
  var file_url = URL.createObjectURL(md_file);
  downoladURL(file_name, file_url);
};

const html_download_handler = () => {
  var raw = document.getElementById('raw').value;
  var html_content = converter_data(raw);
  var file_name = `index.html`;
  var md_file = createTextFile(file_name, html_content, "text/html;charset=utf-8");
  var file_url = URL.createObjectURL(md_file);
  downoladURL(file_name, file_url);
};
const pdf_download_handler = () => {
  const element = document.getElementById('preview-template').contentDocument.body.cloneNode(true);
  element.id ='print';
  document.body.appendChild(element);

  const options = {
    margin: 0,
    filename: 'document.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      putOnlyUsedFonts: true,
      floatPrecision: 16 // or "smart", default is 16
    }
  };

  html2pdf().set(options).from(document.body).save().then(() => {
    element.remove();
  });

};

const init = ev => {
  theme();
  const loading = document.getElementById('loading');
  const back_btn = document.getElementById('back');
  const back_link = back_btn.href;
  back_btn.removeAttribute('href');
  back_btn.onclick = ev => {
    ev.preventDefault();
    loading.classList.add('active');
    setTimeout(() => window.location.replace(back_link), 618);
  };
  choose_template_item();
  const switch_tab = document.getElementById('switch-tab');
  const provider = document.getElementById('provider');
  switch_tab.onclick = ev => {
    switch_tab.classList.toggle('preview');
    provider.classList.toggle('preview');
  };
  editor();
  download_haandler();
};

document.addEventListener('DOMContentLoaded', init);