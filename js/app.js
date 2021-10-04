(function() {
    function ajax(method, url, obj) {
        return new Promise(function(resolve, reject) {
            var xmlhttp;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            } else {
                // code for older browsers - should never happen in these enlightened times
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlhttp.onreadystatechange = function() {
                if(this.readyState == 4) {
                    if(this.status >= 200 && this.status <= 299) {
                        resolve(this.responseText);
                    } else {
                        reject(this.responseText);
                    }
                }
            };
            xmlhttp.open(method, url, true);
            if(obj && method != "GET") {
                xmlhttp.setRequestHeader("Content-Type", "application/json");
                xmlhttp.send(JSON.stringify(obj));
            } else {
                xmlhttp.send();
            }
        });
    }

    function e(id) {
        return document.getElementById(id);
    }

    function show(id) {
        e(id).style.display = "";
    }

    function hide(id) {
        e(id).style.display = "none";
    }

    var questions = {
        addition: [[2,1], [1,4], [2,2], [4,2], [3,4], [2,3], [5,2], [4,5], [3,5], [2,8], [4,4], [2,5], [3,3], [1,8], [6,4], [3,7], [6,3], [5,5], [1,5], [6,2], [2,7], [4,6], [5,7], [8,3], [4,9], [7,6], [6,6], [8,6], [9,8], [6,9], [8,7], [9,5], [9,7]],
        subraction: [[2, 1], [5, 1], [3, 2], [5, 3], [6, 2], [2, 2], [6, 4], [7, 2], [6, 1], [7, 3], [8, 2], [7, 5], [6, 6], [8, 3], [7, 4], [9, 3], [8, 5], [9, 5], [9, 9], [10, 4], [9, 4], [10, 3], [11, 2], [10, 6], [12, 3], [12, 6], [15, 5], [11, 5], [13, 3], [12, 9], [14, 6], [17, 8], [16, 9]],
        multiplication: [[1, 2], [2, 3], [2, 5], [1, 4], [3, 2], [4, 3], [9, 1], [6, 2], [3, 4], [5, 3], [7, 2], [3, 6], [2, 8], [4, 5], [9, 2], [3, 7], [6, 4], [3, 9], [8, 3], [7, 0], [8, 4], [5, 6], [4, 7], [8, 6], [7, 5], [9, 4], [8, 9], [7, 7], [6, 9], [8, 8], [6, 8], [9, 9], [9, 7]],
        division: [[2, 1], [4, 2], [3, 1], [6, 3], [8, 2], [9, 3], [10, 2], [12, 3], [15, 5], [16, 4], [18, 3], [20, 4], [21, 3], [24, 4], [30, 3], [30, 5], [24, 8], [27, 3], [50, 5], [28, 4], [32, 8], [35, 5], [42, 6], [45, 5], [48, 8], [54, 6], [36, 9], [56, 7], [64, 8], [63, 9], [72, 8], [81, 9], [88, 8]]
    }

    var operations = {
        addition: function(a, b) { return a + b},
        subtraction: function(a, b) { return a - b},
        multiplication: function(a, b) { return a * b},
        division: function(a, b) { return a / b}
    }

    function makeHandler(name) {
        var b = e(name);

        b.onclick = function(event) {
            event.preventDefault();
            e("activity").innerText = b.label;

            var op = operations[name];
            var q = e("questions");
            q.innerHTML = "";

            var results = [];
            var inputs = [];

            var startTime = (new Date()).getTime();

            function makeChangeHandler(idx) {
                return function(event) {
                    results[idx].given = event.target.value;
                    results[idx].time = (new Date()).getTime() - startTime;

                    if(event.keyCode === 13 && idx < 32) {
                        inputs[idx + 1].focus();
                    }
                };
            }

            for(var i=0; i<33; i++) {
                var qq = questions[name][i];
                results[i] = { a: qq[0], b: qq[1], correct: op(qq[0], qq[1]), given: null};

                var question = qq[0] + " " + b.innerText + " " + qq[1] + " =";
                var label = document.createElement("label");
                label.for = "q" + i;
                label.innerText = question;
                var input = document.createElement("input");
                input.id = "q" + i;
                input.onchange = input.onkeyup = makeChangeHandler(i);
                inputs[i] = input;
                q.appendChild(label);
                q.appendChild(input);
            }
            hide("menu");
            show("test");

            var timeout = window.setTimeout(function() {
                hide("test");
                show("finished");
                var now = (new Date()).getTime();
                var correct = 0;
                for(var i=0; i<33; i++) {
                    if(results[i].correct == Number(results[i].given)) {
                        correct = correct + 1;
                    }
                }

                var toSave = {
                    first_name: e("first-name").value,
                    last_name: e("last-name").value,
                    grade: e("grade").value,
                    variation: name,
                    time_taken: now - startTime,
                    correct_count: correct,
                    answers: results
                };

                ajax("POST", "/db.php", toSave);

                e("finished").getElementsByTagName("button")[0].onclick = function() {
                    hide("finished");
                    show("menu");
                };
            }, 60 * 1000);
        };
    }

    function showStartPage() {
        makeHandler("addition");
        makeHandler("subtraction");
        makeHandler("multiplication");
        makeHandler("division");
    }

    function init() {
        var firstName = e("first-name");
        var lastName = e("last-name");
        var grade = e("grade");
        var remember = e("remember");
        var start = e("start");

        start.addEventListener("click", function(event) {
            event.preventDefault();
            hide("user-identification");
            show("menu");

            if(remember.checked) {
                localStorage.setItem("saved", JSON.stringify({ firstName: firstName.value, lastName: lastName.value, grade: grade.value}));
            } else {
                localStorage.removeItem("saved");
            }
            showStartPage();
        });

        firstName.onchange = firstName.onkeyup = lastName.onchange = lastName.onkeyup = grade.onchange = grade.onkeyup = function() {
            start.disabled = !(firstName.value && lastName.value && grade.value);
        };

        var saved = localStorage.getItem("saved");
        if(saved) {
            saved = JSON.parse(saved);
            firstName.value = saved.firstName;
            lastName.value = saved.lastName;
            grade.value = saved.grade;
            remember.checked = true;
        }

        firstName.onchange();
    }

    init();

})();
