var c = 1;
var counts = Array(40).fill(0);
var ids = [];
var first = true;

for (var l = 1; l <= 4; l++) {
    var htmlrow = `<div class="row_${l} row"></div>`;
    $('.counters').append(htmlrow);
    for (var t = 1; t <= 10; t++) {
        var cc = ""
        if (c < 10) { cc = "0" + c; } else { cc = c; }
        var htmlcard = `<div class="channel_${c} card" id="card_thing_${c}" onclick="goToSong(${c - 1})">
      <div class="num">${cc}</div>
      <img src="" class="image" id="img_${c}">
      <div class="name">Loading...</div>
      <div class="count odometer" id="count_${c}">0</div>
      </div>`;
        $('.row_' + l).append(htmlcard);
        c += 1;
    }
}

const goToSong = (index) => {
    window.open("https://www.riffusion.com/riff/" + ids[index], "_blank");
}

function updateData(q, data) {
    return setTimeout(function () {
        var cnb = q + 1;
        if (document.getElementById("img_" + cnb + "").src != 'https://api.riffusion.com/storage/v1/object/public/riffs/' + data.author_id + "/image/" + data.image_id + ".jpg") {
            document.getElementById("img_" + cnb + "").src = 'https://api.riffusion.com/storage/v1/object/public/riffs/' + data.author_id + "/image/" + data.image_id + ".jpg";
        }
        $(".channel_" + cnb + " .name").html(data.title);
        $(".channel_" + cnb + " .count").html(Math.floor(data.play_count));
        if (!(counts[q] == data.play_count)) {
            if (counts[q] > data.play_count) {
                colorSwap(cnb, "#f8d7da");
            };
            if (counts[q] < data.play_count) {
                colorSwap(cnb, "#c9e8d0")
            };
            setTimeout(function () { colorSwap(cnb, ""); }, 1000);
        }
        counts[q] = data.play_count;
    }, q * 250);
}

function updateChannels() {
    fetch("https://wb.riffusion.com/v2/featured/all?limit=60", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(data => data.json()).then(dataIDs => {
        ids = [];
        for (var q = 0; q < 40; q++) {
            ids.push(dataIDs[q].id);
        }
        fetch("https://wb.riffusion.com/v2/generations", {
            "headers": {
                "accept": "*/*",
                "content-type": "application/json"
            },
            "body": JSON.stringify({
                "riff_ids": ids
            }),
            "method": "POST",
        }).then(data => data.json()).then(data => {
            data = data.generations;
            data = data.sort((a, b) => b.play_count - a.play_count);
            for (var q = 0; q < 40; q++) {
                updateData(q, data[q]);
            }
            if (first) {
                setTimeout(function () { $('.loader').fadeOut(); $('.counters').fadeIn(1); }, 1)
                first = false;
            }
        });
    });
};
updateChannels();
setInterval(updateChannels, 5000);

function colorSwap(cnb, color) {
    document.getElementById("card_thing_" + cnb + "").style.backgroundColor = color;
}
