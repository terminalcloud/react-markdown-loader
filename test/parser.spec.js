'use strict';

const
  fs = require('fs'),
  path = require('path'),
  parser = require('../src/parser.js');

describe('Parse Markdown', () => {

  let mdExample = '';
  const mdFile = path.join(__dirname, './examples/hello-world.md');

  before(done => {
    fs.readFile(mdFile, 'utf8', (err, data) => {
      if (err) {
        return done(err);
      }

      mdExample = data;
      done();
    });
  });

  it('extracts front matter from markdown', () => {
    const result = parser.parseFrontMatter(mdExample);
    result.should.have.property('attributes');
    result.should.have.property('body');
  });

  it('front matter attributes should contain imports object', () => {
    const result = parser.parseFrontMatter(mdExample);
    result.attributes.should.have.property('imports');
    result.attributes.imports.should.be.a('object');
    result.attributes.imports.should
      .deep.equal({ Button: './button.js', HelloWorld: './hello-world.js' });
  });

  it('render jsx code blocks have the jsx embedded', () => {
    const
      exampleCode = 'example',
      result = parser.jsxBlock(exampleCode);

    result.should.equal(`<div class="run">example</div>`);
  });

  it('render html blocks have html embedded in dangerouslySetInnerHTML', () => {
    const
      exampleCode = '<div class="whatever">Hello!</div>',
      result = parser.htmlBlock(exampleCode);

    result.should.equal(`<div class="run" dangerouslySetInnerHTML={{ __html: \`${exampleCode}\` }}/>`);
  });

  it('parses markdown with live code blocks', () =>
    parser.parse(mdExample).then(result => {
      result.html.should.contain(`<div class="run"><HelloWorld />
<Button label="Hello World" />
</div>`);
    })
  );

  it('parses markdown and created valid html for JSX', () => {
    const
      exampleCode = '![](myImage.png)';
    parser.parse(exampleCode).then(result => {
      result.html.should.equal('<p><img src="myImage.png" alt="" /></p>\n');
    });
  });

});
