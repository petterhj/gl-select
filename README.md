# gl-select.js

Web Components exploration by implementing a HTML select element alternative.

![gl-select](https://raw.githubusercontent.com/petterhj/gl-select/master/screenshot.png "gl-select")

```
<label for="task-status">Task status</label>
<gl-select id="task-status" width="200px">
 <option>Option 1</option>
 <option>Option 2</option>
 <option selected="selected">Option 3</option>
 <option>Option 4</option>   
</gl-select>
```

```
const gls = document.createElement('gl-select');

var o1 = document.createElement('option');
o1.innerHTML = 'Option 1';
gls.appendChild(o1);

document.body.appendChild(gls);

console.log(document.querySelector('gl-select').value);
```