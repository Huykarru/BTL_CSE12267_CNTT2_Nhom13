/* ai.js — CHỨC NĂNG: AI Assistant (AI-1 phân tích rủi ro động + nút Khắc phục, AI-2, AI-3) */
(function(){
  'use strict';
  window.SS = window.SS || {};
  var DB = window.SS.DB, icon = window.SS.icon, fmt = window.SS.fmt;

  // AI-1: phân tích động các SKU dưới ngưỡng, có nút "Khắc phục"
  function ai1Result(){
    var risky = DB.products.filter(function(p){ return p.qty < p.min; });
    if(risky.length === 0){
      return '<div style="background:rgba(5,150,105,.08);border:1px solid rgba(5,150,105,.3);border-radius:12px;padding:16px;color:#059669;font-size:14px;font-weight:600;">'+
        icon('M20 6L9 17l-5-5',18)+' Không còn SKU nào có nguy cơ thiếu hàng. Tất cả sản phẩm đã đạt ngưỡng tồn kho an toàn — rủi ro đã được khắc phục thành công.</div>';
    }
    var html = '<div style="background:rgba(5,150,105,.06);border:1px solid rgba(5,150,105,.25);border-radius:12px;padding:16px;font-size:13.5px;line-height:1.7;">'+
      '<strong style="color:#059669;">Kết quả: '+risky.length+' SKU có nguy cơ cao</strong><br>';
    risky.forEach(function(p){
      var ratio = p.qty / p.min;
      var score = Math.round(Math.min(98, Math.max(40, 100 - ratio*45)));
      var days = Math.max(1, Math.round(p.qty / 8));
      var po = Math.max(20, p.min*2 - p.qty);
      html += '• '+p.name+' ('+p.id+'): điểm '+score+'/100 — dự kiến hết hàng trong '+days+' ngày. '+
        '<button onclick="resolveRisk(\''+p.id+'\')" style="background:#059669;color:#fff;border:none;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:600;cursor:pointer;margin-left:6px;">Khắc phục (nhập '+po+')</button><br>';
    });
    html += '<em style="color:#64748b;font-size:12px;">Gợi ý: Tạo PO nhập tổng '+risky.reduce(function(s,p){return s+Math.max(20,p.min*2-p.qty);},0)+' đơn vị trong tuần này. Bấm "Khắc phục" để mô phỏng nhập hàng, AI sẽ phân tích lại ngay.</em></div>';
    return html;
  }

  // Khắc phục rủi ro: tăng tồn kho vượt ngưỡng → lưu → phân tích lại
  window.resolveRisk = function(sku){
    var p = DB.products.find(function(x){ return x.id===sku; });
    if(!p) return;
    p.qty = Math.max(p.qty, p.min*2 + 50);
    window.SS.saveProducts();
    window.SS.recomputeAlerts();
    window.SS.addResolvedNotif(sku, p.name);
    if(typeof window.SS.renderContent === 'function'){ try{ window.SS.renderContent(window.SS.currentTab); }catch(e){} }
    var o = document.getElementById('out_ai1');
    if(o) o.innerHTML = '<div class="ai-typing" style="padding:12px;color:#64748b;font-size:13px;">Đang phân tích lại dữ liệu tồn kho</div>';
    setTimeout(function(){
      var o2 = document.getElementById('out_ai1');
      if(o2) o2.innerHTML = ai1Result();
    }, 750);
  };

  // Chạy AI theo loại (ai1 động, ai2/ai3 tĩnh)
  function runAI(id, btn){
    var out = document.getElementById('out_'+id);
    if(!out) return;
    if(btn){ btn.disabled = true; btn.innerHTML = '<span class="spin"></span> AI đang xử lý...'; }
    out.innerHTML = '<div class="ai-typing" style="padding:12px;color:#64748b;font-size:13px;">Đang phân tích dữ liệu tồn kho</div>';
    setTimeout(function(){
      var results = {
        ai1: ai1Result(),
        ai2: '<div style="padding:14px;background:#f8fafc;border-radius:10px;font-size:13px;line-height:1.7;"><strong>AI-2 · Location Anomaly:</strong><br>• SKU-004 (Laptop Dell Vostro) đang lưu tại khu ẩm thấp B-02 — khuyến nghị chuyển đến A-01.<br>• Tần suất lấy hàng tại A-02 bất thường vào khung giờ 17h-19h.</div>',
        ai3: '<div style="padding:14px;background:#f8fafc;border-radius:10px;font-size:13px;line-height:1.7;"><strong>AI-3 · Variance Assistant:</strong><br>• Chênh lệch kiểm kê kỳ trước: SKU-005 thiếu 12 cái — nghi vấn thất thoát POS.<br>• Khuyến nghị: kiểm tra camera, khóa nhân viên ca đêm, tạo nhiệm vụ kiểm kê lại.</div>'
      };
      out.innerHTML = results[id] || '';
      if(btn){ btn.disabled = false; btn.innerHTML = 'Phân tích lại'; }
    }, 1000);
  }

  window.SS.ai1Result = ai1Result;
  window.SS.runAI = runAI;
})();
