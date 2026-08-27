/* แถบผลงานเลื่อนทแยง (#showcase)
   ภาพทุกใบเรนเดอร์จากข้อมูล/หน้าเว็บของ รัฐไทยก้าวหน้า เอง — ไม่มีภาพจากภายนอก */
(function () {
  var CARDS = [
    ['structure.jpg',  'ผังโครงสร้างหน่วยงานรัฐ 754 โหนด'],
    ['parliament.jpg', 'ผังที่นั่งสภาผู้แทนราษฎร 500 ที่นั่ง'],
    ['map-crop.jpg',   'แผนที่ผลเลือกตั้ง ส.ส. รายจังหวัด 2569'],
    ['chart-wide.jpg', 'แผนที่โลกเปรียบเทียบข้อมูลรายประเทศ'],
    ['bangkok.jpg',    'ผลเลือกตั้ง ส.ก. กรุงเทพฯ 50 เขต'],
    ['chart-temp.jpg', 'อุณหภูมิเฉลี่ยโลกที่สูงขึ้น'],
    ['referendum.jpg', 'ผลประชามติรัฐธรรมนูญ ภาคใต้'],
    ['chart-bars.jpg', 'ภัยพิบัติธรรมชาติแยกประเภท']
  ];

  /* แถว: [กลับลำดับไหม, ความเร็ว(วินาที), ทิศทาง] */
  var ROWS = [
    [false, 120, 'to-left'],
    [true,  105, 'to-right'],
    [false, 135, 'to-left'],
    [true,  114, 'to-right'],
    [false, 144, 'to-left']
  ];

  function buildCard(item) {
    var cell = document.createElement('div');
    cell.className = 'showcase-cell';

    var card = document.createElement('div');
    card.className = 'showcase-card';

    var img = document.createElement('img');
    img.src = 'images/showcase/' + item[0];
    img.alt = item[1];
    img.loading = 'lazy';
    img.decoding = 'async';

    card.appendChild(img);
    cell.appendChild(card);
    return cell;
  }

  function init() {
    var host = document.getElementById('showcase-rows');
    if (!host) return;

    var base = CARDS.concat(CARDS, CARDS);          /* ยาวพอให้เต็มแถว */
    var reversed = base.slice().reverse();

    ROWS.forEach(function (spec) {
      var cards = spec[0] ? reversed : base;

      var row = document.createElement('div');
      row.className = 'showcase-row';

      var track = document.createElement('div');
      track.className = 'showcase-track ' + spec[2];
      track.style.setProperty('--speed', spec[1] + 's');

      /* วาง 2 ชุดต่อกัน เพื่อให้ลูปที่ -50% ไร้รอยต่อ */
      for (var k = 0; k < 2; k++) {
        var half = document.createElement('div');
        half.className = 'showcase-half';
        cards.forEach(function (item) { half.appendChild(buildCard(item)); });
        track.appendChild(half);
      }

      row.appendChild(track);
      host.appendChild(row);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
