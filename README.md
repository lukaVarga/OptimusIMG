[![Travis build](https://img.shields.io/travis/lukaVarga/OptimusIMG.svg?style=for-the-badge)](https://travis-ci.org/lukaVarga/OptimusIMG)
[![Codecov coverage](https://img.shields.io/codecov/c/github/lukaVarga/OptimusIMG.svg?style=for-the-badge)](https://codecov.io/gh/lukaVarga/OptimusIMG)

![GitHub repo size in bytes](https://img.shields.io/github/repo-size/lukaVarga/OptimusIMG.svg?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/lukaVarga/OptimusIMG.svg?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/lukaVarga/OptimusIMG.svg?style=for-the-badge)

![GitHub release](https://img.shields.io/github/release/lukaVarga/OptimusIMG.svg?style=for-the-badge)
[![npm](https://img.shields.io/npm/v/optimusimg.svg?style=for-the-badge)](https://www.npmjs.com/package/optimusimg)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=for-the-badge)](https://github.com/semantic-release/semantic-release)

# OptimusIMG
OptimusIMG is a Node.js module for optimising images in build and runtime.
It helps you detect which images need further optimisation during your web application
build process and uses optimisation tricks for a faster and better user experience
during runtime.

OptimusIMG runtime library has no JavaScript dependencies, it can run in any SPA (Angular, React, Vue, ...) or any classic webpage environment.
The source is written in Typescript, while the `dist` and `build` files are compiled to plain JS (ES5).

## Installation
`npm install --save optimusimg`

## Requirements
`node >= 8` and `npm >= 5.2.8`. It is possible to use `npm < 5.2.8` but you will need to install additional global npm packages (eg. `npx`).

## Browser support
OptimusIMG is supported in all major browsers which support ES5 (`IE >= 10`, `Chrome >= 23`, `Firefox >= 21`, `Edge`, `Safari >= 6`, `Opera >= 15`)

## Useage
Once you add OptimusIMG to your project (npm, submodule, or,
when using only runtime optimisations, by linking minified js file for a specific version - https://unpkg.com/optimusimg@:version/dist/OptimusIMG.min.js,
or for latest version - https://unpkg.com/optimusimg/dist/OptimusIMG.min.js),
you can use OptimusIMG's functions for optimisation.

### Runtime useage
OptimusIMG currently has three runtime branches - `HtmlElementsCheck`, `LazyLoad` and `ProgressiveLoad`.

#### HtmlElementsCheck
`HtmlElementsCheck` will output console warnings if it detects any images with the proper class which are not properly prepared for responsive development.
You can configure `HtmlElementsCheck` function with the following options:
```
enableConsoleOutput?: boolean; // defaults to true
className?: string; // defaults to 'optimusIMG', will take only images with this class in account
```

#### LazyLoad
`LazyLoad` is responsible for lazily loading images and carousels. You can configure `LazyLoad` with the following options:
```
className?: string; // defaults to 'optimusIMG', will lazily-load all images with this class
carouselClassName?: string; // defaults to 'optimusIMG-carousel', will lazily-load all carousels with this class
carouselToggleImageBtn?: string; // defaults to 'optimusIMG-carousel--toggle-btn', you MUST add this class to all potential buttons which can toggle images of your carousel
```

To ensure `LazyLoad` works properly, you will have to:
- change `src` property of images with `className` into a `data-optimus-lazy-src`, eg: change `<img src="foo" class="optimusIMG">` into `<img data-optimus-lazy-src="foo" class="optimusIMG">`
- add `data-optimus-interval` attribute to all carousels which have the `carouselClassName`. The value of the `data-optimus-interval` should be a number in milliseconds, greater than `1000`.
If your carousel automatically switches images based on a set time interval, the `data-optimus-interval` should match that interval
- add `data-optimus-img-index` to all carousel toggle image buttons which have the `carouselToggleImageBtn` class.
Allowed values are: `next`, `previous` (for next/previous buttons) or any image index, eg `5`, for buttons which allow the user to directly toggle to that specific image.

It is strongly advised you use the `LazyLoad` functionality, which will also make use of the `ProgressiveLoad` functionality automatically (in case any of the images that are lazily loaded is of OptimusIMG progressive image variant).

#### ProgressiveLoad
`ProgressiveLoad` is responsible for progressively loading images. It works in conjunction with `prepare-progressive-images` buildtime function which generates images to be used for progressive loading (see details in the buildtime section).
`ProgressiveLoad` is not configurable.

To ensure `ProgressiveLoad` works properly, you will have to:
- generate progressive images using `npx prepare-progressive-images` (see details in buildtime section)
- if you are using the OptimusIMG `LazyLoad` function
    - change `data-optimus-lazy-src` from eg. `/images/foobar.jpeg` to the (generated with `npx prepare-progressive-images`) progressive image version path `/images/foobar-OptimusIMG-progressive.jpeg`,
    OptimusIMG will then handle the progressive load functionality under the hood automatically both for single images and carousels which are lazily loaded
- else
    - change `src` from eg. `/images/foobar.jpeg` to the (generated with `npx prepare-progressive-images`) progressive image version path `/images/foobar-OptimusIMG-progressive.jpeg`
    - manually trigger `OptimusIMG.ProgressiveLoad.execute()` function whenever you load new images into view (eg. carousel image change event for carousels which are not utilizing OptimusIMG `LazyLoad` functionality, on document
    ready and ajax responses which load new images in case you are utilizing jQuery for that, on component init/mount/etc lifecycle event in case you are using eg. Angular, Vue.js, ReactJS, ..)

`ProgressiveLoad` utilizes CSS transitions to ensure a performant and easy on the eyes transition from the generated progressive image variant (which is used for ensuring as quick as possible initial webpage load),
to the high quality original image variant as soon as the original variant is loaded.

#### Triggering functions
You can trigger re-run of any OptimusIMG function.
This is useful in case you do not with to duplicate your configuration. like this (example in turbolinks, jQuery and Typescript app, custom configuration):
```
// Triggers the LazyLoad for the first time
const LAZY_LOAD: LazyLoad = OptimusIMG.LazyLoad(customConfiguration);

...

$(document).on('turbolinks:load', () => {
    // Triggers LazyLoad after every turbolinks load
    LAZY_LOAD.execute();
});
```
Or like this (example for vanilla JS, default configuration)
```
// Triggers the LazyLoad for the first time
var LAZY_LOAD = OptimusIMG.LazyLoad();

...

function loadPartial() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
     document.getElementById("partial-container").innerHTML = this.responseText;
     // Triggers the LazyLoad in response to eg. ajax function response
     LAZY_LOAD.execute(); // Considering there is no custom configuration, you could easily do OptimusIMG.LazyLoad(); as well
    }
  };
  xhttp.open("GET", "some-partial.html", true);
  xhttp.send();
}
```

**Please note**: `ProgressiveLoad` is an exception - in case you wish to trigger `ProgressiveLoad` manually, you will **only** be able to trigger it by calling the `.execute()` method,
eg. `OptimusIMG.ProgressiveLoad.execute()`, calling `OptimusIMG.ProgressiveLoad()` will **not** trigger the progressive load functionality.

#### React example
The following will trigger lazy loading after a component is mounted.
```
import { RUNTIME as OptimusIMG } from 'optimusimg/build/runtime/index.js';

...

	componentDidMount() {
		...
		OptimusIMG.LazyLoad(configuration?: ILazyLoad);
	}

...
```

#### Angular example
The following will trigger lazy loading after eg. a `CarouselComponent` is mounted.
```
import { Component, OnInit } from '@angular/core';
import LazyLoad from 'optimusimg/src/runtime/lazy_load';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {
  constructor() {}

  ngOnInit() {
    new LazyLoad();
  }

  ...
}
```

### Loading OptimusIMG via cdn and executing functions
```
<script src="https://unpkg.com/optimusimg@1.1.1/dist/OptimusIMG.min.js"></script>
<script>
    ...
    // Triggers lazy load
    OptimusIMG.LazyLoad();
    // Triggers html elements check
    OptimusIMG.HtmlElementsCheck();
    // Triggers progressive load
    OptimusIMG.ProgressiveLoad.execute();
</script>
```

### Buildtime useage
OptimusIMG comes with buildtime scripts. For example, OptimusIMG will prepare a progressive version of your images
which will be used for speeding up the initial load and will, in combination with runtime `ProgressiveImages` function,
automatically load the high-res (original) version of your image and swap the images once the high-res version is loaded.

OptimusIMG also has an image analysis buildtime function which will warn you in case it detects possible optimisations for specific images.

To run buildtime functions, you need to `npm install --save optimusimg` (if you haven't done so already) and then use `npx function` (eg. `npx prepare-progressive-images`):

#### Requirements for buildtime functions
- `npm@5.2.0` or higher (as it ships with npx). To find out which version of npm you are using, type `npm --version`
    - If you are running `npm < 5.2.0` and cannot upgrade, then you can do `npm install -g npx`

#### npx prepare-progressive-images
Prepare progressive images function supports images in `.jpg` (or `.jpeg`) and `.png` formats / file extensions.
The function will make a copy of all images within the folder (and all subfolders) you specify and modify them to be used in runtime for progressive loading.
The images will be in the same formats as the originals and will differ from the original image by `-OptimusIMG-progressive` extension.

The progressive image variants will, in conjunction with the runtime `ProgressiveLoad` functionality, be used for ensuring
the initial load of the webpage is as quick as possible.

Please do not change the name of these images.

#### npx analyse-images
Analyse images function supports images in `.jpg` (or `.jpeg`) and `.png` formats / file extensions.
The function will analyse all images within the folder (and all subfolders) you specify and let you know of possible optimisations.

Please note: in case you have a lot of (big) images in your project, the function might take a couple of minutes to finish analysis.

## Contributing
Clone, `npm install`, code, lint, test, push and open a pull request.
I am only accepting PRs with a 100% code coverage.

### Commit messages
To ensure commit messages follow the same pattern, please use `npm run commit` instead of the standard `git commit`
and follow the commit instructions in the terminal.

### Testing
OptimusIMG uses Jest for testing. To trigger tests - `npm run test`

### Linting
OptimusIMG uses TSLint for linting. To trigger linting - `npm run lint`

## License
OptimusIMG is licensed under the MIT license.
