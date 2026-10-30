<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>角色扮演 · RolePlay Chat</title>
<link rel="manifest" href="manifest-chat.json">
<meta name="theme-color" content="#121212">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="mobile-web-app-capable" content="yes">

<script>
(function(){
  try {
    var pref = localStorage.getItem('rp_theme') || 'auto';
    var isDark = pref === 'dark' || (pref === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    var themeColor = isDark ? '#121212' : '#ffffff';
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', themeColor);
  } catch (e) {}
})();
</script>

<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js"></script>

<style>
*{box-sizing:border-box; -webkit-tap-highlight-color: transparent;}

:root,
html[data-theme="dark"]{
  --bg:#121212; --panel:#1e1e1e; --panel-2:#2a2a2a; --border:#3a3a3a;
  --text:#ececec; --muted:#9e9e9e; --accent:#4d6bfe;
  --bubble-user-bg:#2a2a2a; --bubble-user-fg:#ffffff;
  --bubble-user-em:#e2e8ff; --head-bg:rgba(20,24,36,.72);
  --code-bg:rgba(255,255,255,0.1); --code-fg:#a0a0a0; --pre-bg:#1e1e1e;
  --danger:#ff8080; --danger-bg:rgba(255,128,128,0.2);
  --danger-bg-soft:rgba(255,128,128,0.1); --danger-bg-soft2:rgba(255,128,128,0.15);
  --success:#6bff8b; --overlay-bg:rgba(0,0,0,0.6);
  --auth-overlay-bg:rgba(13,15,22,0.98); --backdrop-bg:rgba(0,0,0,.5);
  --shadow-lg:0 10px 40px rgba(0,0,0,0.5); --shadow-md:0 10px 30px rgba(0,0,0,0.5);
  --cloud-bg:rgba(0,0,0,0.2); --cloud-fg:#6b7280;
  --token-bg:rgba(0,0,0,0.2); --token-fg:#6b7280;
  --toast-bg:#1c2130; --stop-bg:#e05252;
  --scrollbar-thumb:#2a3040; --scrollbar-thumb-hover:#3a4256;
  --conv-active-bg:rgba(124,108,255,0.1);
  --vip-gold: #f5a623; --vip-gold-bg: rgba(245,166,35,0.1); --vip-gold-border: rgba(245,166,35,0.3);
  --font-scale: 1; 
  --global-font-size: 15px; --global-line-height: 1.72;
  --user-font-size: 15px; --user-line-height: 1.72;
  --assistant-font-size: 15px; --assistant-line-height: 1.72;
  --user-bubble-max-width: 78%;
}

html[data-theme="light"]{
  --bg:#ffffff; --panel:#f7f8fa; --panel-2:#eef0f3; --border:#e3e5e8;
  --text:#1a1d21; --muted:#6b7280; --accent:#4d6bfe;
  --bubble-user-bg:#eef1f6; --bubble-user-fg:#1a1d21;
  --bubble-user-em:#33407a; --head-bg:rgba(255,255,255,.8);
  --code-bg:rgba(0,0,0,0.06); --code-fg:#6b7280; --pre-bg:#f6f7f9;
  --danger:#d92d20; --danger-bg:rgba(217,45,32,0.12);
  --danger-bg-soft:rgba(217,45,32,0.06); --danger-bg-soft2:rgba(217,45,32,0.1);
  --success:#16a34a; --overlay-bg:rgba(15,20,30,0.35);
  --auth-overlay-bg:rgba(250,251,252,0.98); --backdrop-bg:rgba(0,0,0,.25);
  --shadow-lg:0 10px 40px rgba(15,20,30,0.08); --shadow-md:0 10px 30px rgba(15,20,30,0.08);
  --cloud-bg:rgba(0,0,0,0.03); --cloud-fg:#6b7280;
  --token-bg:rgba(0,0,0,0.05); --token-fg:#6b7280;
  --toast-bg:#ffffff; --stop-bg:#d92d20;
  --scrollbar-thumb:#d1d5db; --scrollbar-thumb-hover:#9ca3af;
  --conv-active-bg:rgba(77,107,254,0.08);
}

html { height: 100%; height: 100dvh; background-color: var(--bg); overscroll-behavior: none; }
body{
  height:100%; height:100dvh; margin:0;
  background-color:var(--bg); color:var(--text); overflow:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  font-size: calc(15px * var(--font-scale));
  overscroll-behavior: none;
}
button{font-family:inherit;}

.main-app{ height:100%; height:100dvh; display:flex; flex-direction:column; background:var(--bg); overflow:hidden; position:relative; }

/* 侧边栏抽屉 */
.sidebar {
  position: fixed; left: 0; top: 0; bottom: 0; width: 84%; max-width: 340px;
  background: var(--bg); border-right: 1px solid var(--border); z-index: 300;
  transform: translateX(-100%); transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex; flex-direction: column; box-shadow: 4px 0 24px rgba(0,0,0,0.25);
  padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);
}
.sidebar.open { transform: translateX(0); }
.sidebar-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 250; opacity: 0; pointer-events: none; transition: opacity 0.28s; }
.sidebar-backdrop.show { opacity: 1; pointer-events: auto; }
.sidebar-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 16px 12px; flex-shrink: 0; }
.sidebar-title { font-size: calc(16px * var(--font-scale)); font-weight: 600; }
.sidebar-header .header-action { background: none; border: none; color: var(--accent); font-size: calc(24px * var(--font-scale)); cursor: pointer; padding: 2px 10px; border-radius: 8px; line-height: 1; }
.sidebar-header .header-action:hover { background: var(--panel-2); }
.sidebar-list { flex: 1; overflow-y: auto; padding: 0 12px 12px; -webkit-overflow-scrolling: touch; }

.chat-screen { flex: 1; display: flex; flex-direction: column; min-height: 0; background: var(--bg); }

#auth-overlay{position:fixed;inset:0;z-index:999;background:var(--auth-overlay-bg);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;transition:opacity 0.3s;}
#auth-overlay.hidden{opacity:0;pointer-events:none;}
.auth-card{width:100%;max-width:380px;background:var(--panel);border:1px solid var(--border);border-radius:16px;padding:28px 24px;box-shadow:var(--shadow-lg);}
.auth-card h2{font-size: calc(20px * var(--font-scale));font-weight:600;margin:0 0 8px 0;text-align:center;}
.auth-card p{font-size: calc(13px * var(--font-scale));color:var(--muted);text-align:center;margin:0 0 20px 0;}
.auth-card input{width:100%;background:var(--panel-2);border:1px solid var(--border);color:var(--text);border-radius:9px;padding:12px;font-size: calc(14px * var(--font-scale));margin-bottom:12px;outline:none;}
.auth-card input:focus{border-color:var(--accent);}
.auth-card button{width:100%;padding:12px;border-radius:9px;font-size: calc(14px * var(--font-scale));font-weight:600;cursor:pointer;transition:0.2s;border:none;}
.btn-login{background:var(--accent);color:#fff;margin-bottom:10px;}
.btn-login:hover{filter:brightness(1.1);}
.btn-register{background:transparent;color:var(--text);border:1px solid var(--border) !important;}
.btn-register:hover{background:var(--panel-2);}
.auth-msg{font-size: calc(12px * var(--font-scale));text-align:center;margin-top:12px;min-height:18px;}
.auth-msg.error{color:var(--danger);}
.auth-msg.success{color:var(--success);}

.conv-group-title { font-size: calc(13px * var(--font-scale)); color: var(--muted); padding: 16px 12px 8px; font-weight: 500; }
.conv-item { padding: 14px 16px; border-radius: 10px; cursor: pointer; margin-bottom: 2px; border: none; transition: background 0.2s; display: flex; align-items: center; background: transparent; }
.conv-item:hover, .conv-item.active { background: var(--conv-active-bg); }
.conv-item .conv-name { font-size: calc(15px * var(--font-scale)); font-weight: 400; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

label{display:block;font-size:calc(12.5px * var(--font-scale));color:var(--muted);margin:10px 0 5px;}
input,textarea{width:100%;background:var(--panel-2);border:1px solid var(--border);color:var(--text);border-radius:9px;padding:9px 11px;font-size:calc(13.5px * var(--font-scale));font-family:inherit;outline:none;transition:border-color .15s;}
input:focus,textarea:focus{border-color:var(--accent);}
textarea{resize:vertical;line-height:1.55;}
input[type=range]{padding:0;background:none;border:none;-webkit-appearance:none;appearance:none;height:20px;}
input[type=range]::-webkit-slider-runnable-track{height:4px;background:var(--border);border-radius:2px;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:var(--accent);margin-top:-5.5px;cursor:pointer;}
input[type=checkbox]{ width:22px; height:22px; padding:0; margin:0; flex-shrink:0; accent-color:var(--accent); cursor:pointer; border-radius:4px; }

.btn{background:var(--panel-2);border:1px solid var(--border);color:var(--text);padding:8px 14px;border-radius:9px;cursor:pointer;font-size:calc(13.5px * var(--font-scale));transition:.15s;}
.btn:hover{border-color:var(--accent);}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#fff;}
.btn.vip-primary{background:var(--vip-gold);border-color:var(--vip-gold);color:#1a1d21; font-weight:bold;}
.btn.sm{padding:6px 11px;font-size:calc(12.5px * var(--font-scale));}
.btn:disabled{opacity:.45;cursor:not-allowed;}
.btn-logout{background:transparent;color:var(--danger);border:1px solid var(--danger);}
.btn-logout:hover{background:var(--danger-bg-soft);}
.btn-clear-chat{background:transparent;color:var(--danger);border:1px solid var(--danger);}
.btn-clear-chat:hover{background:var(--danger-bg-soft);}
.icon-btn{background:none;border:none;color:var(--muted);font-size:calc(18px * var(--font-scale));cursor:pointer;padding:6px 10px;border-radius:8px;line-height:1;}
.icon-btn:hover{color:var(--text);background:var(--panel-2);}
.icon-btn svg { width: 22px; height: 22px; }

.context-menu { position: fixed; background: var(--panel); border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); padding: 6px 0; z-index: 1000; display: none; min-width: 140px; border: 1px solid var(--border); }
.context-menu.show { display: flex; flex-direction: column; }
.context-menu-item { display: flex; align-items: center; padding: 12px 20px; font-size: calc(15px * var(--font-scale)); color: var(--text); cursor: pointer; gap: 12px; transition: background 0.2s; }
.context-menu-item:hover { background: var(--panel-2); }
.context-menu-item svg { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.context-menu-item.danger { color: var(--danger); }

.settings-list-item { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 16px; background: var(--panel); border: 1px solid var(--border); color: var(--text); font-size: calc(14px * var(--font-scale)); text-align: left; cursor: pointer; transition: background 0.2s; border-radius:12px; margin-bottom:10px; }
.settings-list-item:hover { background: var(--panel-2); }
.settings-list-item .arrow { color: var(--muted); font-size: calc(18px * var(--font-scale)); }

.settings-group { background:var(--panel); border:1px solid var(--border); border-radius:12px; padding: 14px 14px; margin-bottom:12px; }
.settings-group-title { font-size: calc(14px * var(--font-scale)); font-weight: 600; margin-bottom: 12px; color: var(--text); }
.settings-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; margin-top: 16px; }
.settings-row label { margin: 0; font-size: calc(13.5px * var(--font-scale)); color: var(--text); }
.settings-row .val { font-size: calc(12px * var(--font-scale)); color: var(--muted); font-family: monospace; }

.theme-btn-group { display: flex; gap: 8px; margin-top: 8px; }
.theme-btn { flex: 1; padding: 10px 0; border-radius: 8px; background: var(--panel-2); border: 1px solid var(--border); color: var(--muted); font-size: calc(13px * var(--font-scale)); cursor: pointer; transition: 0.2s; }
.theme-btn.active { background: rgba(77,107,254,0.1); border-color: var(--accent); color: var(--accent); }

.chat-head{ display:flex;align-items:center;gap:8px; padding:10px 12px; padding-top:calc(10px + env(safe-area-inset-top)); background-color:var(--bg); border-bottom:1px solid var(--border); flex-shrink:0; }
.chat-head .title{display:flex;flex-direction:column;line-height:1.3;flex:1;min-width:0;padding-left:4px;}
.chat-head .title .n{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:calc(16px * var(--font-scale));}
.head-actions{display:flex;gap:2px;align-items:center;}

#messages { flex: 1; overflow-y: auto; padding: 22px 18px 10px; display: flex; flex-direction: column; gap: 22px; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; background-color: var(--bg); }
.msg { display: flex; flex-direction: column; animation: pop .18s ease; }
@keyframes pop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

.msg.user { align-self: flex-end; max-width: var(--user-bubble-max-width); }
.msg.user .msg-header { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-bottom: 12px; }
.msg.user .avatar { width: calc(38px * var(--font-scale)); height: calc(38px * var(--font-scale)); border-radius: 50%; background: var(--panel-2); color: var(--text); display: flex; align-items: center; justify-content: center; font-size: calc(20px * var(--font-scale)); font-weight: bold; flex-shrink: 0; user-select: none; box-shadow: 0 2px 8px rgba(0,0,0,0.2); overflow: hidden; }
.msg.user .avatar img { width: 100%; height: 100%; object-fit: cover; }
.msg.user .meta { margin: 0; padding: 0; font-size: calc(14px * var(--font-scale)); font-weight: 600; color: var(--text); text-align: right; }
.msg.user .content { background: var(--bubble-user-bg); color: var(--bubble-user-fg); border-radius: 18px; border: none; padding: 11px 15px; font-size: var(--user-font-size); line-height: var(--user-line-height); word-break: break-word; overflow-wrap: anywhere; cursor: pointer; transition: filter 0.2s; display: flex; flex-direction: column; gap: 8px; }
.msg.user .content:active { filter: brightness(0.9); }

.bubble-file-card { display: flex; align-items: center; gap: 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 10px 14px; width: fit-content; max-width: 100%; }
.bubble-file-card .file-icon { width: 36px; height: 36px; color: #4d6bfe; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.bubble-file-card .file-icon svg { width: 28px; height: 28px; stroke: currentColor; fill: none; }
.bubble-file-card .file-info { display: flex; flex-direction: column; }
.bubble-file-card .file-name { font-size: calc(14px * var(--font-scale)); font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.bubble-file-card .file-size { font-size: calc(12px * var(--font-scale)); color: var(--muted); margin-top: 2px; }

.msg.user .content.has-attachment { background: transparent; padding: 0; align-items: flex-end; }
.content.has-attachment .text-bubble { background: var(--bubble-user-bg); border-radius: 18px; padding: 11px 15px; color: var(--bubble-user-fg); max-width: 100%; word-break: break-word; overflow-wrap: anywhere; cursor: pointer; }

.msg.assistant { align-self: flex-start; max-width: 100%; }
.msg.assistant .msg-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.msg.assistant .avatar { width: calc(38px * var(--font-scale)); height: calc(38px * var(--font-scale)); border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: calc(20px * var(--font-scale)); font-weight: bold; flex-shrink: 0; user-select: none; box-shadow: 0 2px 8px rgba(0,0,0,0.2); overflow: hidden; }
.msg.assistant .avatar img { width: 100%; height: 100%; object-fit: cover; }
.msg.assistant .meta { margin: 0; padding: 0; font-size: calc(14px * var(--font-scale)); font-weight: 600; color: var(--text); }
.msg.assistant .meta .vip-icon { color: var(--vip-gold); font-size: 1.1em; margin-left: 4px; }
.msg.assistant .content { background: transparent; border: none; padding: 0; color: var(--text); font-size: var(--assistant-font-size); line-height: var(--assistant-line-height); word-break: break-word; overflow-wrap: anywhere; }
.msg.assistant .content code { background: var(--code-bg); color: var(--code-fg); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
.msg.assistant .content pre { background: var(--pre-bg); padding: 12px; border-radius: 8px; overflow-x: auto; margin: 10px 0; }
.msg.assistant .content pre code { background: transparent; padding: 0; color: inherit; }
.msg.assistant .content ul, .msg.assistant .content ol { padding-left: 20px; margin: 8px 0; }

.msg .meta { font-size: calc(14px * var(--font-scale)); color: var(--muted); margin-bottom: 5px; padding: 0 4px; }
.msg.user .content em { color: var(--bubble-user-em); }
.err{color:var(--danger);font-size:calc(12.5px * var(--font-scale));margin-top:8px;white-space:pre-wrap;line-height:1.5;}
.muted{color:var(--muted);}
.cursor{display:inline-block;width:7px;height:1em;background:var(--accent);vertical-align:-2px;margin-left:2px;animation:blink 1s steps(2) infinite;}
@keyframes blink{50%{opacity:0;}}

#messages.hide-avatar-name .msg-header { display: none !important; }

.msg-actions {display: flex;align-items: center;gap: 8px;margin-top: 6px;padding: 0 4px;font-size: calc(12px * var(--font-scale));color: var(--muted);opacity: 0.6;transition: opacity 0.2s;flex-wrap: wrap;}
.msg-actions:hover { opacity: 1; }
.msg.user .msg-actions { justify-content: flex-end; }
.action-btn {background: none; border: none; color: var(--muted);cursor: pointer; padding: 4px; font-size: calc(12px * var(--font-scale)); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s;}
.action-btn:hover { color: var(--text); background: var(--border); }
.action-btn.delete-btn { color: var(--danger); }
.action-btn.delete-btn:hover { background: var(--danger-bg-soft2); }
.action-btn svg { width: 15px; height: 15px; }

.more-actions-wrap { display: inline-flex; align-items: center; position: relative; }
.more-menu { display: none; position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: var(--panel); border: 1px solid var(--border); border-radius: 8px; padding: 4px; z-index: 10; box-shadow: var(--shadow-md); min-width: 85px; margin-bottom: 6px; }
.more-menu button { width: 100%; display: flex; align-items: center; gap: 6px; justify-content: center; padding: 8px 10px; font-size: 13px; border-radius: 4px; background: transparent; border: none; cursor: pointer; color: var(--text); }
.more-menu button:hover { background: var(--danger-bg-soft); }

.version-switcher { display: flex; align-items: center; gap: 4px; margin: 0 4px; }
.version-switcher span { font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
.version-switcher button { background: none; border: none; color: var(--muted); cursor: pointer; padding: 0 4px; font-size: 14px; font-family: monospace; transition: color 0.2s; }
.version-switcher button:hover:not(:disabled) { color: var(--text); }
.version-switcher button:disabled { opacity: 0.3; cursor: not-allowed; }

.token-display {font-family: monospace; font-size: calc(11px * var(--font-scale)); color: var(--token-fg);background: var(--token-bg); padding: 2px 6px; border-radius: 4px; margin-left: auto;}

.reasoning-box { margin-bottom: 12px; font-size: calc(14px * var(--font-scale)); overflow: hidden; transition: all 0.3s ease; }
.reasoning-header { padding: 4px 0; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: calc(13px * var(--font-scale)); user-select: none; transition: color 0.2s; border-radius: 6px; }
.reasoning-header:hover { color: var(--text); }
.reasoning-header.thinking { color: var(--muted); }
.reasoning-header .arrow-icon { width: 14px; height: 14px; transition: transform 0.3s ease; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.reasoning-header .arrow-icon.up-down { animation: pulse-up-down 1.5s infinite alternate; }
@keyframes pulse-up-down { 0% { transform: translateY(-1px); } 100% { transform: translateY(1px); } }
.reasoning-box.collapsed .reasoning-header .arrow-icon.right { transform: rotate(0deg); }
.reasoning-box:not(.collapsed) .reasoning-header .arrow-icon.right { transform: rotate(90deg); }
.reasoning-content { padding: 8px 0 8px 16px; color: var(--muted); font-size: calc(13px * var(--font-scale)); line-height: 1.6; white-space: pre-wrap; font-family: inherit; border-left: 2px solid var(--border); margin-left: 4px; margin-top: 4px; }
.reasoning-box.collapsed .reasoning-content { display: none; }

.composer-wrap { padding: 10px 16px 16px; padding-bottom: calc(16px + env(safe-area-inset-bottom)); background-color: var(--bg); display: flex; flex-direction: column; align-items: center; flex-shrink:0; }
#agent-selector-bar { display: flex; gap: 8px; overflow-x: auto; width: 100%; max-width: 820px; padding: 0 0 10px 0; scrollbar-width: none; }
#agent-selector-bar::-webkit-scrollbar { display: none; } 
.agent-select-item { display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; border-radius: 20px; cursor: pointer; transition: all 0.2s ease; background: transparent; border: 1px solid transparent; }
.agent-select-item:hover { background: var(--panel-2); }
.agent-select-item.active { background: rgba(77, 107, 254, 0.1); border-color: var(--accent); }
.agent-select-item .name { font-size: calc(13px * var(--font-scale)); color: var(--muted); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.agent-select-item.active .name { color: var(--accent); font-weight: 600; }

.composer { width: 100%; max-width: 820px; background-color: var(--bg); border: 1px solid var(--border); border-radius: 16px; padding: 8px 12px 8px 16px; display: flex; flex-direction: column; transition: border-color 0.2s; position: relative; }
.composer:focus-within { border-color: var(--border); }

.attach-menu { position: absolute; bottom: 55px; right: 10px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 16px; padding: 12px; display: none; gap: 12px; box-shadow: var(--shadow-md); z-index: 100; }
.attach-menu.show { display: flex; }
.attach-option { width: 76px; height: 76px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; background: var(--panel); border: 1px solid var(--border); cursor: pointer; transition: 0.2s; }
.attach-option:hover { background: var(--border); }
.attach-option svg { width: 28px; height: 28px; color: var(--text); }
.attach-option span { font-size: calc(13px * var(--font-scale)); color: var(--text); }

.attachment-preview-container { display: none; flex-wrap: wrap; gap: 8px; padding: 8px 4px; border-bottom: 1px solid var(--border); margin-bottom: 6px; }
.attachment-preview-container.show { display: flex; }
.file-card { position: relative; display: flex; align-items: center; gap: 10px; background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 8px 12px; max-width: 240px; animation: pop .2s ease; }
.file-card .file-icon { width: 32px; height: 32px; color: #4d6bfe; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.file-card .file-icon svg { width: 24px; height: 24px; }
.file-card .file-info { display: flex; flex-direction: column; min-width: 0; }
.file-card .file-name { font-size: calc(13px * var(--font-scale)); color: var(--text); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
.file-card .file-size { font-size: calc(11px * var(--font-scale)); color: var(--muted); }
.file-card .remove-file-btn { position: absolute; top: -6px; right: -6px; background: #666; color: #fff; border: 2px solid var(--bg); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px; line-height: 1; transition: background 0.2s; }
.file-card .remove-file-btn:hover { background: var(--danger); }

#edit-input-header { display: none; align-items: center; justify-content: space-between; padding: 8px 4px 12px; border-bottom: 1px solid var(--border); margin-bottom: 8px; }
#edit-input-header span { font-size: calc(14px * var(--font-scale)); font-weight: 600; color: var(--text); }
#cancel-edit-input-btn { background: var(--panel-2); border: none; border-radius: 50%; width: calc(26px * var(--font-scale)); height: calc(26px * var(--font-scale)); display: flex; align-items: center; justify-content: center; color: var(--text); cursor: pointer; font-size: calc(14px * var(--font-scale)); transition: background 0.2s; }
#cancel-edit-input-btn:hover { background: var(--border); }

.composer-input-area { display: flex; margin-bottom: 6px; }
#input { width: 100%; background: transparent; border: none; color: var(--text); font-size: var(--global-font-size); line-height: 1.6; padding: 8px 0; resize: none; max-height: 200px; min-height: 28px; outline: none; }
.composer-toolbar { display: flex; justify-content: space-between; align-items: center; }
.toolbar-left { display: flex; align-items: center; gap: 8px; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }

.tool-btn { display: inline-flex; align-items: center; gap: 6px; background: var(--panel-2); border: 1px solid var(--border); border-radius: 20px; padding: 4px 10px; font-size: calc(12px * var(--font-scale)); color: var(--muted); cursor: pointer; transition: 0.2s; user-select: none; }
.tool-btn:hover { color: var(--text); border-color: var(--muted); }
.tool-btn.active { background: rgba(77, 107, 254, 0.1); border-color: var(--accent); color: var(--accent); }
.tool-btn.icon-only { padding: 6px; border-radius: 50%; border: none; background: transparent; }
.tool-btn.icon-only:hover { background: var(--panel-2); }
.tool-btn svg { width: calc(14px * var(--font-scale)); height: calc(14px * var(--font-scale)); }
.tool-btn.icon-only svg { width: calc(18px * var(--font-scale)); height: calc(18px * var(--font-scale)); }

.ai-disclaimer { text-align: center; font-size: calc(11px * var(--font-scale)); color: var(--muted); margin-top: 8px; opacity: 0.7; }

.send-btn { width: calc(32px * var(--font-scale)); height: calc(32px * var(--font-scale)); border-radius: 50%; background: var(--accent); color: #fff; border: none; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; flex-shrink: 0; padding: 0; }
.send-btn:hover { filter: brightness(1.1); }
.send-btn:disabled { background: var(--muted); cursor: not-allowed; }
.send-btn.stop { background: var(--stop-bg); cursor: pointer; }
.send-btn svg { width: calc(16px * var(--font-scale)); height: calc(16px * var(--font-scale)); display: block; }

#char-settings-modal { position: fixed; inset: 0; z-index: 200; background: var(--bg); display: none; align-items: stretch; justify-content: stretch; padding: 0; transition: opacity 0.3s; }
#char-settings-modal.show { display: flex; }
.char-settings-card { width: 100%; max-width: none; height: 100%; height: 100dvh; background: var(--panel); border: none; border-radius: 0; padding: 16px 16px; padding-top: calc(16px + env(safe-area-inset-top)); padding-bottom: calc(16px + env(safe-area-inset-bottom)); box-shadow: none; max-height: none; display: flex; flex-direction: column; overflow: hidden; }
.char-settings-card h3 { font-size: calc(18px * var(--font-scale)); margin: 0; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.char-settings-card .form-group { margin-bottom: 14px; }
.char-settings-card label { font-size: calc(12px * var(--font-scale)); color: var(--muted); margin-bottom: 6px; display: block; }
.char-settings-card textarea { min-height: 80px; }

.settings-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; }
.settings-tabs { display: flex; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 10px; flex-shrink: 0; }
.settings-tab { padding: 8px 16px; background: transparent; border: none; color: var(--muted); cursor: pointer; border-radius: 8px; font-size: calc(13px * var(--font-scale)); font-weight: 600; transition: 0.2s; }
.settings-tab:hover { color: var(--text); }
.settings-tab.active { color: var(--accent); background: rgba(77,107,254,0.1); }
.settings-tab.locked { color: var(--muted); cursor: not-allowed; opacity: 0.6; background: transparent !important; }
.settings-tab.locked:hover { color: var(--muted); }
.settings-tab .tab-lock { font-size: 11px; margin-left: 4px; vertical-align: middle; display: inline-block; }
.settings-tab .tab-locked-text { font-size: 10px; color: var(--danger); margin-left: 3px; font-weight: normal; opacity: 0.9; }
.settings-body { flex: 1; overflow-y: auto; padding-right: 4px; min-height: 0; }
.settings-footer { display: flex; justify-content: flex-end; align-items: center; border-top: 1px dashed var(--border); padding-top: 14px; margin-top: 12px; flex-shrink: 0; gap: 10px; }
.hidden { display: none !important; }

.agent-tab-list { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 12px; border-bottom: 1px dashed var(--border); }
.agent-tab { padding: 6px 12px; border-radius: 20px; background: var(--panel-2); border: 1px solid var(--border); font-size: calc(13px * var(--font-scale)); white-space: nowrap; cursor: pointer; transition: 0.2s; }
.agent-tab.active { background: rgba(77,107,254,0.1); border-color: var(--accent); color: var(--accent); }
.agent-tab .del-agent { margin-left: 6px; color: var(--danger); font-weight: bold; }
.agent-tab .del-agent:hover { color: #ff3b3b; }

.avatar-upload-container { display: flex; flex-direction: column; align-items: center; margin-bottom: 16px; }
.avatar-preview { width: 80px; height: 80px; border-radius: 50%; background: var(--panel-2); border: 2px dashed var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; transition: border-color 0.2s; }
.avatar-preview:hover { border-color: var(--accent); }
.avatar-preview img { width: 100%; height: 100%; object-fit: cover; }
.avatar-preview span { font-size: calc(28px * var(--font-scale)); }
.avatar-upload-text { font-size: calc(12px * var(--font-scale)); color: var(--accent); margin-top: 8px; cursor: pointer; }

#vip-modal, #admin-modal { position: fixed; inset: 0; z-index: 600; background: var(--overlay-bg); display: none; align-items: center; justify-content: center; padding: 20px; transition: opacity 0.3s; }
#vip-modal.show, #admin-modal.show { display: flex; }
.vip-card { width: 100%; max-width: 500px; background: var(--panel); border: 1px solid var(--border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-lg); max-height: 90vh; display: flex; flex-direction: column; overflow-y: auto; }
.vip-card h3 { font-size: calc(20px * var(--font-scale)); margin: 0 0 16px 0; font-weight: 600; color: var(--vip-gold); display: flex; align-items: center; gap: 8px;}
.vip-plans { display: flex; gap: 10px; margin-bottom: 20px; }
.vip-plan { flex: 1; border: 1px solid var(--border); border-radius: 12px; padding: 16px 10px; text-align: center; cursor: pointer; transition: 0.2s; background: var(--panel-2); }
.vip-plan:hover { border-color: var(--vip-gold-border); }
.vip-plan.active { border-color: var(--vip-gold); background: var(--vip-gold-bg); box-shadow: 0 0 10px rgba(245,166,35,0.2); }
.vip-plan .p-name { font-size: calc(14px * var(--font-scale)); font-weight: 600; margin-bottom: 4px; }
.vip-plan .p-price { font-size: calc(18px * var(--font-scale)); color: var(--vip-gold); font-weight: bold; }
.vip-plan .p-price span { font-size: calc(12px * var(--font-scale)); font-weight: normal; }
.qr-container { text-align: center; margin-bottom: 20px; background: #fff; padding: 10px; border-radius: 12px; }
.qr-container img { width: 200px; height: 200px; object-fit: contain; }
.qr-tip { font-size: calc(13px * var(--font-scale)); color: var(--muted); margin-bottom: 16px; text-align: center;}
.qr-tip strong { color: var(--text); }
.payment-input-group { display: flex; gap: 10px; margin-bottom: 16px; }
.payment-input-group input { flex: 1; }
.admin-order-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 8px; background: var(--panel-2); }
.admin-order-info { font-size: calc(12px * var(--font-scale)); color: var(--muted); }
.admin-order-info span { display: block; margin-bottom: 2px; }
.admin-order-info strong { color: var(--text); font-size: calc(14px * var(--font-scale));}

@media(max-width:640px){
  .msg{max-width: 92%;}
  #messages{padding:16px 12px 8px;}
  .composer-wrap { padding: 8px 12px 12px; padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
  .composer { padding: 6px 10px 6px 12px; border-radius: 14px; }
  .tool-btn span { display: none; }
  .tool-btn { padding: 6px; border-radius: 50%; border: none; background: transparent; }
  .tool-btn.active { background: rgba(77, 107, 254, 0.1); color: var(--accent); }
  .vip-plans { flex-direction: column; }
  .char-settings-card { padding: 12px; padding-top: calc(12px + env(safe-area-inset-top)); padding-bottom: calc(12px + env(safe-area-inset-bottom)); }
}

::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:2px;}
::-webkit-scrollbar-thumb:hover{background:var(--scrollbar-thumb-hover);}
::-webkit-scrollbar-track{background:transparent;}

#account-modal { position: fixed; inset: 0; z-index: 650; background: var(--overlay-bg); display: none; align-items: center; justify-content: center; padding: 20px; }
#account-modal.show { display: flex; }
.account-item { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 8px; background: var(--panel-2); }
.account-item .acc-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--panel); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; border: 1px solid var(--border); }
.account-item .acc-avatar img { width: 100%; height: 100%; object-fit: cover; }
#accountMiniAvatar { width:42px; height:42px; border-radius:50%; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; overflow:hidden; margin:0; }
#accountMiniAvatar img { width:100%; height:100%; object-fit:cover; }

.api-input-row { display: flex; gap: 6px; align-items: center; position: relative; }
.api-input-row > input { flex: 1; }
.api-hist-btn { padding: 8px 12px; font-size: 12px; flex-shrink: 0; }
.api-history-panel { display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: var(--panel); border: 1px solid var(--border); border-radius: 9px; box-shadow: var(--shadow-md); z-index: 200; max-height: 220px; overflow-y: auto; padding: 4px; }
.api-history-panel.show { display: block; }
.api-history-item { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 6px; }
.api-history-item:hover { background: var(--panel-2); }
.api-history-item .api-hist-text { flex: 1; font-family: monospace; font-size: 12px; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.api-history-item .api-hist-act { padding: 3px 8px; font-size: 11px; flex-shrink: 0; }
.api-history-item .api-hist-del { color: var(--danger); border-color: var(--danger); }
.api-history-empty { padding: 10px; font-size: 12px; color: var(--muted); text-align: center; }

.floating-ball-container { position: fixed; z-index: 1000; touch-action: none; }
.floating-ball { width: 54px; height: 54px; border-radius: 50%; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; color: #4d6bfe; cursor: grab; transition: transform 0.1s, box-shadow 0.2s; user-select: none; border: 1px solid rgba(0,0,0,0.05); }
html[data-theme="dark"] .floating-ball { background: rgba(40, 40, 40, 0.9); border-color: rgba(255,255,255,0.1); }
.floating-ball:active { cursor: grabbing; transform: scale(0.95); }
.floating-ball.dragging { transition: none; }
.floating-menu { position: absolute; background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 8px 0; box-shadow: var(--shadow-lg); display: none; flex-direction: column; min-width: 140px; animation: pop .2s ease; z-index: 1001; }
.floating-menu.show { display: flex; }
.menu-item { padding: 12px 16px; font-size: calc(14px * var(--font-scale)); color: var(--text); display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.2s; }
.menu-item:hover { background: var(--panel-2); }
.menu-item .arrow { color: var(--muted); font-size: 16px; }
</style>
</head>
<body>

<div id="debug-overlay" style="display:none; position:fixed; inset:0; z-index:9999; background:#000; color:#ff8080; padding:20px; overflow:auto; font-family:monospace; white-space:pre-wrap; font-size:14px;"></div>
<script>
  window.onerror = function(message, source, lineno, colno, error) {
    var debug = document.getElementById('debug-overlay');
    if (debug) { debug.style.display = 'block'; debug.textContent += '【错误】' + message + '\n位置: ' + source + ':' + lineno + ':' + colno + '\n\n'; }
  };
  window.addEventListener('unhandledrejection', function(event) {
    var debug = document.getElementById('debug-overlay');
    if (debug) { debug.style.display = 'block'; debug.textContent += '【Promise错误】' + (event.reason ? event.reason.message || JSON.stringify(event.reason) : '未知') + '\n\n'; }
  });
</script>

<div id="auth-overlay" class="hidden">
  <div class="auth-card">
    <h2 id="auth-title">欢迎回来</h2>
    <p id="auth-subtitle">登录以同步您的角色与聊天记录</p>
    <input type="email" id="auth-email" placeholder="邮箱地址" autocomplete="email">
    <input type="password" id="auth-password" placeholder="密码（至少6位）" autocomplete="current-password">
    <button class="btn-login" id="auth-login-btn">登录</button>
    <button class="btn-register" id="auth-register-btn">没有账号？点击注册</button>
    <div class="auth-msg" id="auth-msg"></div>

    <div id="authSavedAccounts" style="display:none; margin-top:16px; border-top:1px dashed var(--border); padding-top:14px;">
      <div style="font-size:calc(12px * var(--font-scale)); color:var(--muted); margin-bottom:8px;">本机已保存的账号（点击切换）</div>
      <div id="authSavedList"></div>
    </div>
  </div>
</div>

<div class="main-app" id="mainApp">
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header" id="sidebarHeader" style="justify-content: space-between;">
      <span class="sidebar-title" id="sidebarTitle" style="display:none;">已选 0 项</span>
      <div style="display:flex; gap:10px; align-items:center; margin-left:auto;">
        <button class="header-action" id="multiCancelBtn" style="display:none; font-size:16px; color:var(--text); font-weight:normal; padding:0 10px;">取消</button>
        <button class="header-action" id="multiDeleteBtn" style="display:none; font-size:16px; color:var(--danger); font-weight:normal; padding:0 10px;">删除</button>
        <button class="header-action" id="newConvBtn" title="新建会话" style="font-size: 28px; color: var(--accent); line-height: 1; padding-right: 4px;">＋</button>
      </div>
    </div>
    <div class="sidebar-list" id="sidebarList">
      <div id="conversationListContainer"></div>
    </div>
  </aside>
  <div class="sidebar-backdrop" id="sidebarBackdrop"></div>

  <div class="chat-screen" id="chatScreen">
    <header class="chat-head">
      <button class="icon-btn" id="openSidebarBtn" title="会话列表">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
      <div class="title"><span class="n" id="headName">聊天</span></div>
      <div class="head-actions">
        <button class="icon-btn" id="openCharSettingsBtn" title="角色设定 / 设置">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>
      </div>
    </header>

    <div id="messages"></div>

    <div class="composer-wrap">
      <div id="agent-selector-bar"></div>
      <div class="composer">
        <div id="edit-input-header"><span>修改输入</span><button id="cancel-edit-input-btn">✕</button></div>
        <div id="attachmentPreviewContainer" class="attachment-preview-container"></div>
        <div class="composer-input-area"><textarea id="input" rows="1" placeholder="发消息"></textarea></div>
        <div class="composer-toolbar">
          <div class="toolbar-left">
            <button class="tool-btn" id="deepThinkBtn" title="深度思考">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>
              <span>深度思考</span>
            </button>
            <button class="tool-btn" id="searchBtn" title="智能搜索">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>智能搜索</span>
            </button>
          </div>
          <div class="toolbar-right">
            <button class="tool-btn icon-only" id="attachBtn" title="上传文件">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </button>
            <button id="sendBtn" class="send-btn" title="发送">
              <svg id="sendIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 16px; height: 16px;"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
              <svg id="stopIcon" viewBox="0 0 24 24" fill="currentColor" stroke="none" style="display: none; width: 14px; height: 14px;"><rect x="6" y="6" width="12" height="12" rx="2"></rect></svg>
            </button>
          </div>
        </div>
        <div id="attachMenu" class="attach-menu">
            <div class="attach-option" id="attachAlbumBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>相册</span>
            </div>
            <div class="attach-option" id="attachFileBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <span>文件</span>
            </div>
        </div>
        <input type="file" id="albumInput" style="display: none;" accept="image/*">
        <input type="file" id="fileInput" style="display: none;" accept=".txt,.md,.json,.csv,.docx,.pdf">
      </div>
      <div class="ai-disclaimer">回答由 AI 生成，仅供参考</div>
    </div>
  </div>
</div>

<div id="context-menu" class="context-menu">
  <div class="context-menu-item" id="cm-rename"><svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span>重命名</span></div>
  <div class="context-menu-item" id="cm-pin"><svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg><span>置顶</span></div>
  <div class="context-menu-item" id="cm-select"><svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg><span>多选</span></div>
  <div class="context-menu-item danger" id="cm-delete"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg><span>删除</span></div>
</div>

<!-- ============ 设置弹窗（全屏） ============ -->
<div id="char-settings-modal">
  <div class="char-settings-card">
    <div class="settings-modal-header">
      <h3>设定 <span id="betaBadge" style="display:none; background:var(--vip-gold); color:#000; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:bold; margin-left:6px;">内测版</span></h3>
      <button class="icon-btn" id="closeSettingsBtn">✕</button>
    </div>

    <div class="settings-tabs">
      <button class="settings-tab active" data-stab="role">当前角色</button>
      <button class="settings-tab" data-stab="beautify">美化</button>
      <button class="settings-tab locked" data-stab="global" id="globalSettingsTab">全局设置 <span class="tab-lock">🔒</span><span class="tab-locked-text">未完成</span></button>
    </div>

    <div class="settings-body" id="settingsTabRole">
      <div class="settings-group">
        <div class="settings-group-title">接口配置</div>
        <label>API 地址（Base URL）</label>
        <div class="api-input-row">
          <input id="apiBase" placeholder="https://api.openai.com/v1" spellcheck="false" autocomplete="off">
          <button class="btn sm api-hist-btn" id="apiBaseHistoryBtn" type="button" title="历史记录">▾</button>
          <div class="api-history-panel" id="apiBaseHistoryPanel"></div>
        </div>
        <label>API Key</label>
        <div class="api-input-row">
          <input id="apiKey" type="password" placeholder="sk-..." spellcheck="false" autocomplete="off">
          <button class="btn sm api-hist-btn" id="apiKeyHistoryBtn" type="button" title="历史记录">▾</button>
          <div class="api-history-panel" id="apiKeyHistoryPanel"></div>
        </div>
        <label>模型名</label>
        <div style="display:flex; gap:6px; align-items:center;">
          <input id="model" placeholder="gpt-4o-mini" spellcheck="false" style="flex:1;">
          <button class="btn sm" id="fetchModelsBtn" style="white-space:nowrap;">获取</button>
        </div>
        <div id="modelListContainer" style="display:none; margin-top:8px; max-height:150px; overflow-y:auto; background:var(--panel-2); border:1px solid var(--border); border-radius:9px; padding:4px;"></div>
      </div>

      <div class="form-group" style="margin-top: 16px;">
        <label>指令</label>
        <textarea id="modalCharPrompt" rows="10" spellcheck="false" placeholder="请在这里输入角色设定、世界观、说话风格等指令..."></textarea>
      </div>
      <div id="roleTabTip" style="font-size: calc(12px * var(--font-scale)); color: var(--muted); padding: 6px 4px 0; line-height: 1.6;">
        提示：角色名、头像、开场白等请到「全局设置」中修改。
      </div>
    </div>

    <!-- 美化 Tab -->
    <div class="settings-body hidden" id="settingsTabBeautify">
      <div class="settings-group">
        <div class="settings-group-title">主题</div>
        <div class="theme-btn-group" style="margin-top:0;">
          <button class="theme-btn" data-theme-value="light">浅色</button>
          <button class="theme-btn" data-theme-value="dark">深色</button>
          <button class="theme-btn" data-theme-value="auto">跟随系统</button>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">字体与排版</div>
        <div class="settings-row" style="margin-top:0;">
          <label>字体大小（我的 / AI 共用）</label>
          <span class="val" id="valUnifiedFontSize">15px</span>
        </div>
        <input type="range" id="rangeUnifiedFontSize" min="12" max="24" step="0.5" value="15">

        <div class="settings-row">
          <label>行间距（我的 / AI 共用）</label>
          <span class="val" id="valUnifiedLineHeight">1.72</span>
        </div>
        <input type="range" id="rangeUnifiedLineHeight" min="1.2" max="2.5" step="0.05" value="1.72">

        <div style="font-size:calc(12px * var(--font-scale)); color:var(--muted); margin-top:10px; line-height:1.6;">
          提示：点击底部「保存」后才会生效；未保存直接关闭，将保持上一次的设置。
        </div>
      </div>
    </div>

    <div class="settings-body hidden" id="settingsTabGlobal">
      <button class="settings-list-item" id="openAccountBtn" style="margin-bottom:14px; background:var(--panel-2);">
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="avatar-preview" id="accountMiniAvatar"><span style="font-size:20px;">👤</span></div>
          <div style="text-align:left;">
            <div style="font-weight:600; font-size:calc(14px * var(--font-scale));">账号</div>
            <div id="accountMiniEmail" style="font-size:calc(12px * var(--font-scale)); color:var(--muted); word-break:break-all;">未登录</div>
            <!-- 新增：用户 ID 展示 -->
            <div style="font-size:calc(12px * var(--font-scale)); color:var(--accent); margin-top:4px;" id="accountMiniPublicId">
              ID: 加载中...
            </div>
          </div>
        </div>
        <span class="arrow">›</span>
      </button>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <span class="settings-group-title" style="margin:0;">角色列表</span>
        <button class="btn sm" id="addAgentBtn" style="font-size:calc(12px * var(--font-scale)); padding: 4px 8px;">➕ 添加角色</button>
      </div>
      <div class="agent-tab-list" id="agentTabList"></div>

      <div class="settings-group-title" style="font-size:calc(13px * var(--font-scale)); margin-bottom:8px;">AI 角色头像</div>
      <div class="avatar-upload-container">
        <div class="avatar-preview" id="avatarPreview" title="点击更换头像"><span>🤖</span></div>
        <div class="avatar-upload-text" id="avatarUploadText">点击更换头像</div>
        <input type="file" id="avatarFileInput" accept="image/*" style="display: none;">
      </div>

      <div class="settings-group-title" style="font-size:calc(13px * var(--font-scale)); margin-bottom:8px; border-top:1px dashed var(--border); padding-top:16px;">当前对话你的头像</div>
      <div class="avatar-upload-container">
        <div class="avatar-preview" id="userAvatarPreview" title="点击更换你的头像"><span>👤</span></div>
        <div class="avatar-upload-text" id="userAvatarUploadText">点击更换你的头像</div>
        <input type="file" id="userAvatarFileInput" accept="image/*" style="display: none;">
      </div>

      <div class="form-group" style="margin-top:16px; border-top:1px dashed var(--border); padding-top:16px;">
        <label>角色名</label>
        <input id="modalCharName" spellcheck="false">
      </div>
      <div class="form-group">
        <label>开场白（仅在群里没记录时发送）</label>
        <textarea id="modalGreeting" rows="2" spellcheck="false"></textarea>
      </div>

      <button class="settings-list-item" id="goToVip" style="background:var(--vip-gold-bg); border-color:var(--vip-gold-border);">
        <div style="display:flex; align-items:center;"><span style="margin-right:10px; font-size:20px;">👑</span><span style="color:var(--vip-gold); font-weight:600;">开通会员</span></div>
        <span class="arrow">›</span>
      </button>

      <div class="settings-group">
        <div class="settings-group-title">默认 AI 头像</div>
        <div class="avatar-upload-container" style="margin-top: 10px;">
          <div class="avatar-preview" id="globalAvatarPreview" title="点击更换默认 AI 头像"><span>🤖</span></div>
          <div class="avatar-upload-text" id="globalAvatarUploadText">点击更换默认 AI 头像</div>
          <input type="file" id="globalAvatarFileInput" accept="image/*" style="display: none;">
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">默认用户头像</div>
        <div class="avatar-upload-container" style="margin-top: 10px;">
          <div class="avatar-preview" id="globalUserAvatarPreview" title="点击更换默认用户头像"><span>👤</span></div>
          <div class="avatar-upload-text" id="globalUserAvatarUploadText">点击更换默认用户头像</div>
          <input type="file" id="globalUserAvatarFileInput" accept="image/*" style="display: none;">
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">接口高级参数</div>
        <label>温度 <span id="tempVal">0.85</span></label>
        <input id="temperature" type="range" min="0" max="2" step="0.05" value="0.85">
        <label>单次最大回复长度（tokens）</label>
        <input id="maxTokens" type="number" min="64" max="32000" step="64">
        <label>上下文保留条数</label>
        <input id="ctxLimit" type="number" min="4" max="200" step="2">
      </div>

      <div class="settings-group">
        <div class="settings-group-title">你的设定</div>
        <label>你的名字</label>
        <input id="userName" spellcheck="false">
        <label>你的人设（可留空）</label>
        <textarea id="userPrompt" rows="3" spellcheck="false"></textarea>
      </div>

      <div class="settings-group">
        <div class="settings-group-title">外观设置</div>
        <div class="settings-row" style="margin-top:0;">
          <label for="chkHideAvatarName" style="cursor:pointer; margin:0;">隐藏头像和名字</label>
          <input type="checkbox" id="chkHideAvatarName">
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:10px; margin-top:16px;">
        <button class="btn" id="exportBtn" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          导出聊天记录
        </button>
        <button class="btn primary" id="applyBtn" style="width:100%;">保存全局设置</button>
        <button class="btn btn-clear-chat" id="clearChatBtn" style="width:100%;">清空当前会话记录</button>
        <button class="btn btn-logout" id="logoutBtn" style="width:100%;">退出登录</button>
      </div>

      <div style="text-align:center; padding:20px 0 6px; color:var(--muted); font-size:calc(11.5px * var(--font-scale));">
        <span id="appVersionTrigger" style="cursor:pointer;">RolePlay · v<span id="appVersionDisplay">1.0.2</span></span>
      </div>
    </div>

    <div class="settings-footer">
      <button class="btn" id="cancelCharSettingsBtn">取消</button>
      <button class="btn primary" id="saveCharSettingsBtn">保存</button>
    </div>
  </div>
</div>

<div id="vip-modal">
  <div class="vip-card">
    <h3>👑 开通会员</h3>
    <p style="font-size:calc(13px * var(--font-scale)); color:var(--muted); margin-top:-8px; margin-bottom:16px;">解锁无限畅聊，享受高级特权。</p>
    <div class="vip-plans" id="vipPlans">
      <div class="vip-plan active" data-plan="月卡" data-amount="30"><div class="p-name">月卡</div><div class="p-price">¥30<span>/月</span></div></div>
      <div class="vip-plan" data-plan="季卡" data-amount="80"><div class="p-name">季卡</div><div class="p-price">¥80<span>/季</span></div></div>
      <div class="vip-plan" data-plan="年卡" data-amount="258"><div class="p-name">年卡</div><div class="p-price">¥258<span>/年</span></div></div>
    </div>
    <div class="qr-tip">请使用微信/支付宝扫码支付 <strong id="payAmountText">¥30</strong><br><span style="font-size:calc(11px * var(--font-scale)); color:var(--danger);">支付时请在备注里填写你的账号ID：<strong id="vipUserPublicId">加载中...</strong></span></div>
    <div class="qr-container"><img src="pay.png" alt="收款码"></div>
    <div class="payment-input-group">
      <input type="text" id="paymentNoteInput" placeholder="请输入付款单号后4位/填写的备注">
      <button class="btn vip-primary" id="submitVipOrderBtn">提交</button>
    </div>
    <div class="actions" style="display:flex; justify-content:flex-end;"><button class="btn" id="closeVipModal">关闭</button></div>
  </div>
</div>

<div id="admin-modal">
  <div class="vip-card" style="max-width: 600px;">
    <h3 style="color:var(--text);">📋 订单审核台</h3>
    
    <!-- 新增：管理员按ID直接开通面板 -->
    <div class="settings-group" style="margin-top:10px; background:var(--bg);">
      <div class="settings-group-title">手动按 ID 开通</div>
      <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
        <input type="text" id="adminManualUid" placeholder="输入 10001 或 nc2 等" style="flex:1;">
        <select id="adminManualPlan" class="btn" style="width:auto; padding:9px 11px;">
          <option value="月卡">月卡</option>
          <option value="季卡">季卡</option>
          <option value="年卡">年卡</option>
        </select>
        <button class="btn primary" onclick="adminManualAddVip()">开通</button>
      </div>
      <div id="adminSearchResult" style="font-size:12px; color:var(--muted); margin-top:4px; display:none;"></div>
    </div>

    <div id="adminOrderList" style="flex:1; overflow-y:auto; min-height:100px; margin-bottom:16px;"></div>
    <div class="actions" style="display:flex; justify-content:flex-end;"><button class="btn" id="closeAdminModal">关闭</button></div>
  </div>
</div>

<div id="account-modal">
  <div class="vip-card" style="max-width:480px;">
    <h3 style="color:var(--text);">👤 账号管理</h3>
    <div style="margin-bottom:16px;">
      <div class="settings-group-title" style="font-size:calc(13px * var(--font-scale)); margin-bottom:10px;">当前账号</div>
      <div class="account-item" id="currentAccountBox" style="cursor:default;"></div>
    </div>
    <div style="margin-bottom:16px;">
      <div class="settings-group-title" style="font-size:calc(13px * var(--font-scale)); margin-bottom:10px;">其他已保存账号</div>
      <div id="accountListBox"></div>
    </div>
    <div style="display:flex; gap:10px;">
      <button class="btn primary" id="addAccountBtn" style="flex:1;">＋ 添加账号</button>
      <button class="btn" id="closeAccountModal">关闭</button>
    </div>
  </div>
</div>

<div id="floating-ball-container" class="floating-ball-container" style="position:fixed; z-index:1000; touch-action:none;">
  <div id="floating-ball" class="floating-ball">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:24px; height:24px;">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  </div>
  <div id="floating-menu" class="floating-menu">
    <div class="menu-item" id="fab-account">账号 <span class="arrow">›</span></div>
  </div>
</div>
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script>
const CURRENT_VERSION = '1.0.2';

// 版本号逐段按数字比较，"2.3.10" > "2.3.9" 才不会被字符串比较坑到
function compareVersion(a, b) {
  const pa = String(a || '0').split('.').map(n => parseInt(n, 10) || 0);
  const pb = String(b || '0').split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

const katexExt = {
  extensions: [
    {
      name: 'blockKatex', level: 'block',
      start(src) { return src.match(/\$\$|\\\[/)?.index; },
      tokenizer(src, tokens) {
        const rule = /^(?:\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\])/;
        const match = rule.exec(src);
        if (match) { return { type: 'blockKatex', raw: match[0], text: match[1] || match[2] }; }
      },
      renderer(token) {
        try { return katex.renderToString(token.text, { throwOnError: false, displayMode: true, trust: true }); }
        catch (e) { return token.raw; }
      }
    },
    {
      name: 'inlineKatex', level: 'inline',
      start(src) { return src.match(/\$|\\\(/)?.index; },
      tokenizer(src, tokens) {
        const rule = /^(?:\$([^$\n]+?)\$|\\\(([^\n]+?)\\\))/;
        const match = rule.exec(src);
        if (match) { return { type: 'inlineKatex', raw: match[0], text: match[1] || match[2] }; }
      },
      renderer(token) {
        try { return katex.renderToString(token.text, { throwOnError: false, displayMode: false, trust: true }); }
        catch (e) { return token.raw; }
      }
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('appVersionDisplay');
    if (el) el.textContent = CURRENT_VERSION;
    if (window.marked && window.katex) { marked.use(katexExt); }
});

const SUPABASE_URL = 'https://bpkipmnvvrjsfckzhfrl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_K5hZV5mkiX0GHchcYIr7dQ_Z7ICn1mu';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = s => document.querySelector(s);
const msgBox = $('#messages');
const inputEl = $('#input');
let USER_ID = null;
let currentPublicUserId = ''; // 新增：对外展示的用户ID
let isBetaUser = false;
let isFeatureEnabled = false;
let currentConversationId = null;
let currentConversation = null;
let currentAgents = [];
let currentAgentId = null;
let conversationsCache = [];
let cfg = {};
let msgs = [];
let busy = false;
let abortCtrl = null;
let hasBoundEvents = false;
let hasBoundThemeUI = false;
let currentLoadedUserId = null;
let isRegisterMode = false;
let globalDefaultAvatar = null;
let globalDefaultUserAvatar = null;
let activeLeafId = null;
let currentUserEmail = '';
let ignoreRefreshUntil = 0;
let currentVipStatus = { is_vip: false, expire_at: null };
let selectedVipPlan = { name: '月卡', amount: 30 };
let editingMsgIndex = null;
let editingAgentId = null;
let pendingFiles = [];
let isMultiSelectMode = false;
let selectedConvs = new Set();

let settingsDraft = null;

let styleConfig = {
    fontSize: 15,
    lineHeight: 1.72,
    userFontSize: 15,
    userLineHeight: 1.72,
    assistantFontSize: 15,
    assistantLineHeight: 1.72,
    userBubbleWidth: 78,
    hideAvatarName: false
};

const DEFAULTS = {
  apiBase: '', apiKey: '', model: '', temperature: 0.85, maxTokens: 1024, ctxLimit: 30,
  userName: '旅人', userPrompt: '一个刚搬来这座城市的人，喜欢在傍晚散步。'
};

function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 5); }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// 系统固定对话时 active_leaf_id 只存本地，避免多用户互相覆盖
async function persistActiveLeafId(leafId) {
    if (!currentConversationId) return;
    if (currentConversation && currentConversation.is_system_fixed) {
        try { localStorage.setItem('rp_fixed_leaf_' + USER_ID + '_' + currentConversationId, leafId || ''); } catch(e) {}
        return;
    }
    try {
        await supabaseClient.from('conversations').update({ active_leaf_id: leafId }).eq('id', currentConversationId);
    } catch(e) { console.warn('保存 active_leaf_id 失败:', e); }
}

function getAvatarHtml(agentId) {
    let avatar = '🤖';
    const agent = currentAgents.find(a => a.id === agentId);
    if (agent && agent.avatar) avatar = agent.avatar;
    else if (globalDefaultAvatar) avatar = globalDefaultAvatar;
    if (avatar.startsWith('data:image') || avatar.startsWith('http')) {
        return `<img src="${escapeHtml(avatar)}" alt="avatar">`;
    }
    return escapeHtml(avatar);
}

function getUserAvatarHtml() {
    let avatar = '👤';
    if (currentConversation && currentConversation.user_avatar) avatar = currentConversation.user_avatar;
    else if (globalDefaultUserAvatar) avatar = globalDefaultUserAvatar;
    if (avatar.startsWith('data:image') || avatar.startsWith('http')) {
        return `<img src="${escapeHtml(avatar)}" alt="avatar">`;
    }
    return escapeHtml(avatar);
}

function renderContent(s, isStreaming = false){
  if (!s) return '';
  try {
      let rawHtml = marked.parse(s, { breaks: true, gfm: true });
      return DOMPurify.sanitize(rawHtml, {
          ADD_TAGS: ['math','mrow','mi','mo','mn','msup','msub','mfrac','msqrt','mroot','mtable','mtr','mtd','semantics','annotation','mtext','mspace','menclose','mstyle','merror','svg','path','line','g','defs','use','clipPath','rect','img'],
          ADD_ATTR: ['encoding','xmlns','class','style','aria-hidden','focusable','role','viewBox','preserveAspectRatio','d','fill','stroke','stroke-width','x','y','width','height','transform','rx','ry','x1','x2','y1','y2','cx','cy','r','fill-opacity','stroke-linecap','stroke-linejoin','stroke-miterlimit','stroke-dasharray','stroke-dashoffset','clip-path','id','href','xlink:href','xmlns:xlink','src','alt']
      });
  } catch (e) {
      console.error('解析失败:', e);
      return escapeHtml(s).replace(/\n/g, '<br>');
  }
}

function autoResize(){ inputEl.style.height = 'auto'; inputEl.style.height = Math.min(inputEl.scrollHeight, 180) + 'px'; }

function openSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebarBackdrop');
  if (sb) sb.classList.add('open');
  if (bd) bd.classList.add('show');
}
function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('sidebarBackdrop');
  if (sb) sb.classList.remove('open');
  if (bd) bd.classList.remove('show');
  if (isMultiSelectMode) toggleMultiSelectMode(false);
}

function openChatScreen() { closeSidebar(); }
function closeChatScreen() { openSidebar(); }
function switchTab() { }

function hasGlobalSettingsPermission() {
    if (!isFeatureEnabled) return false;
    if (document.body.getAttribute('data-rp-auth-unlocked') !== 'true') return false;
    return true;
}

function updateGlobalSettingsTabLock() {
  const globalTab = document.getElementById('globalSettingsTab');
  if (!globalTab) return;
  const lockIcon = globalTab.querySelector('.tab-lock');
  const lockedText = globalTab.querySelector('.tab-locked-text');
  if (hasGlobalSettingsPermission()) {
    globalTab.classList.remove('locked');
    if (lockIcon) lockIcon.textContent = '🔓';
    if (lockedText) lockedText.style.display = 'none';
  } else {
    globalTab.classList.add('locked');
    if (lockIcon) lockIcon.textContent = '🔒';
    if (lockedText) lockedText.style.display = 'inline';
  }
}

function switchSettingsTab(tab) {
  if (tab === 'global' && !hasGlobalSettingsPermission()) return;
  document.querySelectorAll('.settings-tab').forEach(t => {
    t.classList.toggle('active', t.getAttribute('data-stab') === tab);
  });
  const roleTab = document.getElementById('settingsTabRole');
  const beautifyTab = document.getElementById('settingsTabBeautify');
  const globalTab = document.getElementById('settingsTabGlobal');
  if (tab === 'role') {
    roleTab.classList.remove('hidden');
    beautifyTab.classList.add('hidden');
    globalTab.classList.add('hidden');
  } else if (tab === 'beautify') {
    roleTab.classList.add('hidden');
    beautifyTab.classList.remove('hidden');
    globalTab.classList.add('hidden');
  } else {
    roleTab.classList.add('hidden');
    beautifyTab.classList.add('hidden');
    globalTab.classList.remove('hidden');
  }
}

function openSettingsModal(defaultTab = 'role') {
  closeAllApiHistoryPanels();
  if (currentConversation) {
    currentAgents = JSON.parse(JSON.stringify(currentConversation.agents || []));
    if (currentAgents.length === 0) {
      currentAgents.push({ id: generateId(), name: '新角色', prompt: '', greeting: '', avatar: '' });
    }
    editingAgentId = currentAgents[0].id;
    renderCharSettings();
    updateUserAvatarPreview(currentConversation.user_avatar);
  }
  renderAccountMini();
  initBeautifyDraft();
  if (defaultTab === 'global' && !hasGlobalSettingsPermission()) defaultTab = 'role';
  switchSettingsTab(defaultTab);
  document.getElementById('char-settings-modal').classList.add('show');
}

const THEME_KEY = 'rp_theme';
const THEME_TS_KEY = 'rp_theme_ts';

function getThemePref(){ try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch(e){ return 'auto'; } }
function effectiveTheme(pref){
  if (pref === 'light' || pref === 'dark') return pref;
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
}

function applyTheme(pref, opts = {}){
  const { persist = true, ts = null } = opts;
  const eff = effectiveTheme(pref);
  document.documentElement.setAttribute('data-theme', eff);
  document.documentElement.style.colorScheme = eff;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', eff === 'dark' ? '#121212' : '#ffffff');
  document.querySelectorAll('.theme-btn').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-theme-value') === pref);
  });
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, pref);
      if (ts) localStorage.setItem(THEME_TS_KEY, String(ts));
    } catch(e){ console.warn('本地主题存储失败:', e); }
  }
  return eff;
}

function applyStyleConfig() {
    const scale = styleConfig.fontSize / 15;
    document.documentElement.style.setProperty('--font-scale', scale);
    document.documentElement.style.setProperty('--global-font-size', styleConfig.fontSize + 'px');
    document.documentElement.style.setProperty('--global-line-height', styleConfig.lineHeight);
    document.documentElement.style.setProperty('--user-font-size', styleConfig.userFontSize + 'px');
    document.documentElement.style.setProperty('--user-line-height', styleConfig.userLineHeight);
    document.documentElement.style.setProperty('--assistant-font-size', styleConfig.assistantFontSize + 'px');
    document.documentElement.style.setProperty('--assistant-line-height', styleConfig.assistantLineHeight);

    styleConfig.userBubbleWidth = 78;
    document.documentElement.style.setProperty('--user-bubble-max-width', '78%');

    if (msgBox) msgBox.classList.toggle('hide-avatar-name', !!styleConfig.hideAvatarName);
    if ($('#chkHideAvatarName')) $('#chkHideAvatarName').checked = !!styleConfig.hideAvatarName;
}

function initBeautifyDraft() {
    const f = Number(styleConfig.userFontSize) || 15;
    const l = Number(styleConfig.userLineHeight) || 1.72;
    settingsDraft = { fontSize: f, lineHeight: l, theme: getThemePref() };
    updateBeautifyUI();
}

function updateBeautifyUI() {
    if (!settingsDraft) return;
    const rf = $('#rangeUnifiedFontSize');
    const vf = $('#valUnifiedFontSize');
    if (rf) rf.value = settingsDraft.fontSize;
    if (vf) vf.textContent = settingsDraft.fontSize + 'px';
    const rl = $('#rangeUnifiedLineHeight');
    const vl = $('#valUnifiedLineHeight');
    if (rl) rl.value = settingsDraft.lineHeight;
    if (vl) vl.textContent = settingsDraft.lineHeight;
    document.querySelectorAll('.theme-btn').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-theme-value') === settingsDraft.theme);
    });
}

function applyGlobalAvatar(base64) {
    globalDefaultAvatar = base64;
    const preview = $('#globalAvatarPreview');
    if (preview) {
        if (base64) preview.innerHTML = `<img src="${base64}" alt="avatar">`;
        else preview.innerHTML = `<span>🤖</span>`;
    }
}

function applyGlobalUserAvatar(base64) {
    globalDefaultUserAvatar = base64;
    const preview = $('#globalUserAvatarPreview');
    if (preview) {
        if (base64) preview.innerHTML = `<img src="${base64}" alt="avatar">`;
        else preview.innerHTML = `<span>👤</span>`;
    }
}

let appearanceRetryTimer = null;
async function syncAppearanceToCloud() {
    if (!USER_ID) return;
    try {
        const appearanceData = {
            version: CURRENT_VERSION,
            theme: getThemePref(),
            theme_updated_at: Date.now(),
            fontSize: styleConfig.fontSize,
            lineHeight: styleConfig.lineHeight,
            userFontSize: styleConfig.userFontSize,
            userLineHeight: styleConfig.userLineHeight,
            assistantFontSize: styleConfig.assistantFontSize,
            assistantLineHeight: styleConfig.assistantLineHeight,
            userBubbleWidth: 78,
            hideAvatarName: !!styleConfig.hideAvatarName
        };
        if (globalDefaultAvatar) appearanceData.defaultAvatar = globalDefaultAvatar;
        if (globalDefaultUserAvatar) appearanceData.defaultUserAvatar = globalDefaultUserAvatar;
        const { error } = await supabaseClient.from('agent_settings').upsert({
            id: USER_ID,
            appearance: appearanceData
        });
        if (error) throw error;
    } catch (e) {
        console.warn('同步外观到云端失败，稍后重试:', e);
        if (!appearanceRetryTimer) {
            appearanceRetryTimer = setTimeout(() => {
                appearanceRetryTimer = null;
                syncAppearanceToCloud();
            }, 5000);
        }
    }
}

function setupThemeUI(){
  if (hasBoundThemeUI) return;
  hasBoundThemeUI = true;

  applyTheme(getThemePref(), { persist: false });
  applyGlobalAvatar(globalDefaultAvatar);
  applyGlobalUserAvatar(globalDefaultUserAvatar);
  applyStyleConfig();

  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (getThemePref() === 'auto') applyTheme('auto', { persist: false }); };
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else if (mq.addListener) mq.addListener(handler);
  }

  window.addEventListener('storage', (e) => {
      if (e.key === THEME_KEY && e.newValue) applyTheme(e.newValue, { persist: false });
  });

  const closeSettings = () => {
      closeAllApiHistoryPanels();
      settingsDraft = null;
      document.getElementById('char-settings-modal').classList.remove('show');
  };
  if($('#closeSettingsBtn')) $('#closeSettingsBtn').addEventListener('click', closeSettings);
  if($('#cancelCharSettingsBtn')) $('#cancelCharSettingsBtn').addEventListener('click', () => {
      currentAgents = currentConversation ? (currentConversation.agents || []) : [];
      if (currentAgents.length > 0) currentAgentId = currentAgents[0].id;
      renderAgentSelector();
      settingsDraft = null;
      closeSettings();
  });
  if($('#char-settings-modal')) $('#char-settings-modal').addEventListener('click', (e) => {
      if (e.target.id === 'char-settings-modal') closeSettings();
  });

  document.querySelectorAll('.settings-tab').forEach(tab => {
      tab.addEventListener('click', () => {
          const stab = tab.getAttribute('data-stab');
          if (stab === 'global' && !hasGlobalSettingsPermission()) {
              alert('内测功能尚未开放，请等待版本更新。');
              return;
          }
          switchSettingsTab(stab);
          closeAllApiHistoryPanels();
      });
  });

  if($('#goToVip')) $('#goToVip').addEventListener('click', () => {
      $('#vipUserPublicId').textContent = currentPublicUserId || '未获取到';
      $('#vip-modal').classList.add('show');
  });
  if($('#closeVipModal')) $('#closeVipModal').addEventListener('click', () => $('#vip-modal').classList.remove('show'));

  document.querySelectorAll('.vip-plan').forEach(plan => {
      plan.addEventListener('click', () => {
          document.querySelectorAll('.vip-plan').forEach(p => p.classList.remove('active'));
          plan.classList.add('active');
          selectedVipPlan.name = plan.getAttribute('data-plan');
          selectedVipPlan.amount = parseFloat(plan.getAttribute('data-amount'));
          $('#payAmountText').textContent = '¥' + selectedVipPlan.amount;
      });
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-theme-value');
          if (settingsDraft) {
              settingsDraft.theme = val;
              document.querySelectorAll('.theme-btn').forEach(el => {
                  el.classList.toggle('active', el.getAttribute('data-theme-value') === val);
              });
          } else {
              applyTheme(val, { persist: true, ts: Date.now() });
              syncAppearanceToCloud();
          }
      });
  });

  if ($('#rangeUnifiedFontSize')) {
      $('#rangeUnifiedFontSize').addEventListener('input', (e) => {
          if (!settingsDraft) return;
          settingsDraft.fontSize = parseFloat(e.target.value);
          const v = $('#valUnifiedFontSize');
          if (v) v.textContent = settingsDraft.fontSize + 'px';
      });
  }
  if ($('#rangeUnifiedLineHeight')) {
      $('#rangeUnifiedLineHeight').addEventListener('input', (e) => {
          if (!settingsDraft) return;
          settingsDraft.lineHeight = parseFloat(e.target.value);
          const v = $('#valUnifiedLineHeight');
          if (v) v.textContent = settingsDraft.lineHeight;
      });
  }

  if ($('#chkHideAvatarName')) {
      $('#chkHideAvatarName').addEventListener('change', (e) => {
          styleConfig.hideAvatarName = !!e.target.checked;
          applyStyleConfig();
          syncAppearanceToCloud();
      });
  }

  if($('#globalAvatarPreview')) {
      $('#globalAvatarPreview').addEventListener('click', () => $('#globalAvatarFileInput').click());
      $('#globalAvatarUploadText').addEventListener('click', () => $('#globalAvatarFileInput').click());
      $('#globalAvatarFileInput').addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function(event) {
              const img = new Image();
              img.onload = function() {
                  const canvas = document.createElement('canvas');
                  const size = 200;
                  canvas.width = size; canvas.height = size;
                  const ctx = canvas.getContext('2d');
                  const minSize = Math.min(img.width, img.height);
                  const sx = (img.width - minSize) / 2;
                  const sy = (img.height - minSize) / 2;
                  ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, size, size);
                  const base64 = canvas.toDataURL('image/jpeg', 0.8);
                  applyGlobalAvatar(base64);
                  syncAppearanceToCloud();
                  msgBox.innerHTML = '';
                  msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
                  e.target.value = '';
              };
              img.src = event.target.result;
          };
          reader.readAsDataURL(file);
      });
  }

  if($('#globalUserAvatarPreview')) {
      $('#globalUserAvatarPreview').addEventListener('click', () => $('#globalUserAvatarFileInput').click());
      $('#globalUserAvatarUploadText').addEventListener('click', () => $('#globalUserAvatarFileInput').click());
      $('#globalUserAvatarFileInput').addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function(event) {
              const img = new Image();
              img.onload = function() {
                  const canvas = document.createElement('canvas');
                  const size = 200;
                  canvas.width = size; canvas.height = size;
                  const ctx = canvas.getContext('2d');
                  const minSize = Math.min(img.width, img.height);
                  const sx = (img.width - minSize) / 2;
                  const sy = (img.height - minSize) / 2;
                  ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, size, size);
                  const base64 = canvas.toDataURL('image/jpeg', 0.8);
                  applyGlobalUserAvatar(base64);
                  syncAppearanceToCloud();
                  msgBox.innerHTML = '';
                  msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
                  e.target.value = '';
              };
              img.src = event.target.result;
          };
          reader.readAsDataURL(file);
      });
  }

  if($('#appVersionTrigger')) {
      let clickCount = 0;
      let clickTimer = null;
      $('#appVersionTrigger').addEventListener('click', () => {
          clickCount++;
          if (clickCount === 2) {
              clickCount = 0;
              clearTimeout(clickTimer);
              openAdminPanel();
          } else {
              clickTimer = setTimeout(() => { clickCount = 0; }, 500);
          }
      });
  }
  if($('#closeAdminModal')) $('#closeAdminModal').addEventListener('click', () => $('#admin-modal').classList.remove('show'));
}

function updateCloudStatusUI(isOnline) {
    const bar = $('#cloud-status-bar');
    const text = $('#cloud-status-text');
    if (!bar || !text) return;
    if (isOnline) { bar.className = 'online'; text.textContent = '云端已连接'; }
    else { bar.className = 'offline'; text.textContent = '云端未连接，数据可能无法同步'; }
}

setInterval(async () => {
    if (!USER_ID) return;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const { error } = await supabaseClient.from('agent_settings').select('id').limit(1).abortSignal(controller.signal);
        clearTimeout(timeoutId);
        if (error) throw error;
        updateCloudStatusUI(true);
    } catch (e) { updateCloudStatusUI(false); }
}, 60000);

function loadCfg(){
  if(!USER_ID) return Object.assign({}, DEFAULTS);
  try{
    const raw = localStorage.getItem('rp_cfg_' + USER_ID);
    return raw ? Object.assign({}, DEFAULTS, JSON.parse(raw)) : Object.assign({}, DEFAULTS);
  }catch(e){ return Object.assign({}, DEFAULTS); }
}
function saveCfg(){
  if(!USER_ID) return;
  try{ localStorage.setItem('rp_cfg_' + USER_ID, JSON.stringify(cfg)); }catch(e){}
}

async function checkFeatureFlags() {
    isBetaUser = false;
    isFeatureEnabled = false;
    if (!USER_ID) return;
    try {
        const { data, error } = await supabaseClient
            .from('app_config')
            .select('beta_user_ids, is_global_release')
            .eq('id', 'feature_flags')
            .single();
        if (error) throw error;
        if (data) {
            let whitelist = [];
            if (Array.isArray(data.beta_user_ids)) {
                whitelist = data.beta_user_ids;
            } else if (typeof data.beta_user_ids === 'string') {
                try { whitelist = JSON.parse(data.beta_user_ids); } catch(e){}
            }
            const isInWhitelist = whitelist.includes(USER_ID);
            isBetaUser = isInWhitelist;
            isFeatureEnabled = data.is_global_release === true || isInWhitelist;
            if (isFeatureEnabled) {
                document.body.setAttribute('data-rp-auth-unlocked', 'true');
            } else {
                document.body.removeAttribute('data-rp-auth-unlocked');
            }
        }
    } catch (e) {
        console.warn('检查灰度开关失败:', e);
        isBetaUser = false;
        isFeatureEnabled = false;
        document.body.removeAttribute('data-rp-auth-unlocked');
    }
}

// ====== 版本门禁 ======
// 全屏锁死遮罩，只有"当前版本 < 云端最低版本"且命中生效范围时才会显示
function showVersionLockOverlay(current, required) {
  if (document.getElementById('version-lock-overlay')) return;
  const ov = document.createElement('div');
  ov.id = 'version-lock-overlay';
  ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#121212;color:#ececec;' +
    'display:flex;align-items:center;justify-content:center;flex-direction:column;padding:32px;' +
    'text-align:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;';
  ov.innerHTML =
    '<div style="font-size:40px;margin-bottom:16px;">🔒</div>' +
    '<div style="font-size:18px;font-weight:600;margin-bottom:12px;">版本已停用</div>' +
    '<div style="font-size:14px;color:#9e9e9e;line-height:1.75;max-width:320px;">' +
      '当前版本 <b style="color:#4d6bfe;">v' + escapeHtml(current) + '</b> 已无法使用。<br>' +
      '请向创作者获取最新版本（需 <b style="color:#4d6bfe;">v' + escapeHtml(required) + '</b> 或更高）。' +
    '</div>' +
    '<div style="font-size:12px;color:#6b7280;margin-top:20px;max-width:320px;line-height:1.6;">' +
      '若已拿到新版仍看到此页，请关闭页面重新打开（或清除浏览器缓存）。' +
    '</div>';
  document.body.appendChild(ov);
}

// 返回 true = 放行；false = 已锁死，调用方必须停止后续加载
// 查询失败 → 放行（弱网优先可用性），这是明确选择的策略
async function enforceVersionGate(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('app_config')
      .select('beta_user_ids, min_version, min_version_scope')
      .eq('id', 'feature_flags')
      .maybeSingle();
    if (error) throw error;
    if (!data) return true;
    if (!data.min_version || data.min_version === '0.0.0') return true;

    let whitelist = [];
    if (Array.isArray(data.beta_user_ids)) whitelist = data.beta_user_ids;
    else if (typeof data.beta_user_ids === 'string') {
      try { whitelist = JSON.parse(data.beta_user_ids); } catch(e){}
    }
    const isInWhitelist = whitelist.includes(userId);
    const scope = data.min_version_scope || 'beta';

    const applies = (scope === 'all') || (scope === 'beta' && isInWhitelist);
    if (!applies) return true;

    if (compareVersion(CURRENT_VERSION, data.min_version) < 0) {
      showVersionLockOverlay(CURRENT_VERSION, data.min_version);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('版本门禁检查失败，放行:', e);
    return true;
  }
}

async function fetchGlobalSettings() {
    if (!USER_ID) return false;
    try {
        const { data, error } = await supabaseClient
            .from('agent_settings')
            .select('api_base, api_key, model, temperature, max_tokens, ctx_limit, user_name, user_prompt, appearance, is_vip, vip_expire_at')
            .eq('id', USER_ID).maybeSingle();

        if (error) {
            console.warn('⚠️ 全局配置拉取失败:', error.message);
            updateCloudStatusUI(false); updateGlobalUI(); return false;
        }

        if (data) {
            if (data.api_base) cfg.apiBase = data.api_base;
            if (data.api_key) cfg.apiKey = data.api_key;
            if (data.model) cfg.model = data.model;
            if (data.temperature !== null && data.temperature !== undefined) cfg.temperature = data.temperature;
            if (data.max_tokens !== null && data.max_tokens !== undefined) cfg.maxTokens = data.max_tokens;
            if (data.ctx_limit !== null && data.ctx_limit !== undefined) cfg.ctxLimit = data.ctx_limit;
            if (data.user_name) cfg.userName = data.user_name;
            if (data.user_prompt) cfg.userPrompt = data.user_prompt;

            currentVipStatus.is_vip = data.is_vip || false;
            currentVipStatus.expire_at = data.vip_expire_at;

            if (data.appearance) {
                const app = data.appearance;
                let localTheme = null;
                try { localTheme = localStorage.getItem('rp_theme'); } catch(e){}
                if (localTheme) applyTheme(localTheme, { persist: false });
                else if (app.theme && ['auto','light','dark'].includes(app.theme)) applyTheme(app.theme, { persist: true });
                if (app.defaultAvatar) applyGlobalAvatar(app.defaultAvatar);
                if (app.defaultUserAvatar) applyGlobalUserAvatar(app.defaultUserAvatar);

                const uf = (app.userFontSize !== undefined) ? Number(app.userFontSize)
                         : (app.assistantFontSize !== undefined ? Number(app.assistantFontSize)
                         : (app.fontSize !== undefined ? Number(app.fontSize) : 15));
                const ul = (app.userLineHeight !== undefined) ? Number(app.userLineHeight)
                         : (app.assistantLineHeight !== undefined ? Number(app.assistantLineHeight)
                         : (app.lineHeight !== undefined ? Number(app.lineHeight) : 1.72));
                styleConfig.fontSize = uf;
                styleConfig.lineHeight = ul;
                styleConfig.userFontSize = uf;
                styleConfig.assistantFontSize = uf;
                styleConfig.userLineHeight = ul;
                styleConfig.assistantLineHeight = ul;
                styleConfig.userBubbleWidth = 78;
                if (app.hideAvatarName !== undefined) styleConfig.hideAvatarName = !!app.hideAvatarName;

                applyStyleConfig();
            }

            saveCfg(); updateGlobalUI(); updateCloudStatusUI(true); return true;
        } else {
            try {
                await supabaseClient.from('agent_settings').insert({
                    id: USER_ID, api_base: cfg.apiBase, api_key: cfg.apiKey, model: cfg.model,
                    temperature: Number(cfg.temperature), max_tokens: Number(cfg.maxTokens), ctx_limit: Number(cfg.ctxLimit),
                    user_name: cfg.userName, user_prompt: cfg.userPrompt,
                    appearance: { version: CURRENT_VERSION, theme: getThemePref(), theme_updated_at: Date.now() }
                });
            } catch (insertErr) { console.warn('写入默认全局配置失败:', insertErr.message); }
            updateGlobalUI(); return false;
        }
    } catch (e) { console.error('❌ 全局配置请求异常:', e); updateCloudStatusUI(false); updateGlobalUI(); }
    return false;
}

async function saveGlobalSettings() {
    if (!USER_ID) return;
    try {
        const { error } = await supabaseClient.from('agent_settings').upsert({
            id: USER_ID, api_base: cfg.apiBase, api_key: cfg.apiKey, model: cfg.model,
            temperature: Number(cfg.temperature), max_tokens: Number(cfg.maxTokens), ctx_limit: Number(cfg.ctxLimit),
            user_name: cfg.userName, user_prompt: cfg.userPrompt,
            appearance: {
                version: CURRENT_VERSION,
                theme: getThemePref(),
                theme_updated_at: Date.now(),
                defaultAvatar: globalDefaultAvatar,
                defaultUserAvatar: globalDefaultUserAvatar,
                fontSize: styleConfig.fontSize,
                lineHeight: styleConfig.lineHeight,
                userFontSize: styleConfig.userFontSize,
                userLineHeight: styleConfig.userLineHeight,
                assistantFontSize: styleConfig.assistantFontSize,
                assistantLineHeight: styleConfig.assistantLineHeight,
                userBubbleWidth: 78,
                hideAvatarName: !!styleConfig.hideAvatarName
            }
        });
        if (error) { console.error('❌ 保存全局配置失败:', error.message); updateCloudStatusUI(false); }
        else updateCloudStatusUI(true);
    } catch (e) { console.error('❌ 保存全局配置异常:', e); updateCloudStatusUI(false); }
}

// ★ 所有人都会拉取系统固定对话
async function loadConversations() {
    if (!USER_ID) return [];
    try {
        let query = supabaseClient.from('conversations')
            .select('id, agent_name, agent_prompt, greeting, created_at, avatar, user_avatar, active_leaf_id, is_pinned, agents, is_system_fixed, is_hidden_prompt')
            .or(`user_id.eq.${USER_ID},is_system_fixed.eq.true`);

        const { data, error } = await query
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });
        if (error) throw error;
        updateCloudStatusUI(true); return data || [];
    } catch (e) { console.error('❌ 加载会话列表失败:', e); updateCloudStatusUI(false); return []; }
}

async function createConversation() {
    if (!USER_ID) return null;
    try {
        const defaultAgentId = generateId();
        const defaultAgents = [{
            id: defaultAgentId, name: '新角色', prompt: '请在这里输入角色设定...', greeting: '你好，我是新角色。', avatar: ''
        }];
        const { data, error } = await supabaseClient.from('conversations').insert({
            user_id: USER_ID,
            agent_name: '新角色',
            agent_prompt: '请在这里输入角色设定...',
            greeting: '你好，我是新角色。',
            agents: defaultAgents
        }).select().single();
        if (error) throw error; return data;
    } catch (e) { console.error('❌ 创建会话失败:', e); updateCloudStatusUI(false); return null; }
}

async function saveConversationSettings(convId, agents, userAvatar) {
    if (!USER_ID || !convId) return;
    try {
        const mainAgent = agents[0] || {name: '角色', prompt: '', greeting: '', avatar: ''};
        const { error } = await supabaseClient.from('conversations')
            .update({
                agents: agents,
                user_avatar: userAvatar,
                agent_name: mainAgent.name,
                agent_prompt: mainAgent.prompt,
                greeting: mainAgent.greeting,
                avatar: mainAgent.avatar
            }).eq('id', convId);
        if (error) console.error('❌ 保存会话设定失败:', error.message);

        const c = conversationsCache.find(x => x.id === convId);
        if (c) { c.agents = agents; c.user_avatar = userAvatar; c.agent_name = mainAgent.name; }
        if (currentConversation && currentConversation.id === convId) {
            currentConversation.agents = agents;
            currentConversation.user_avatar = userAvatar;
            currentConversation.agent_name = mainAgent.name;
        }
    } catch (e) { console.error('❌ 保存会话设定异常:', e); }
}

async function togglePinConversation(convId, currentStatus) {
    if (!USER_ID) return;
    try {
        await supabaseClient.from('conversations').update({ is_pinned: !currentStatus }).eq('id', convId);
        const convs = await loadConversations();
        conversationsCache = convs;
        renderConversationList(convs);
    } catch (e) { console.error('❌ 切换置顶失败:', e); }
}

async function deleteConversation(convId) {
    if (!USER_ID || !convId) return;
    const c0 = conversationsCache.find(x => x.id === convId);
    if (c0 && c0.is_system_fixed) { alert('系统固定对话不可删除'); return; }
    if (!confirm('确定要删除这个会话及所有聊天记录吗？')) return;
    try {
        await supabaseClient.from('conversations').delete().eq('id', convId);
        await supabaseClient.from('chat_messages').delete().eq('conversation_id', convId);
        conversationsCache = conversationsCache.filter(c => c.id !== convId);
        if (currentConversationId === convId) {
            currentConversationId = null;
            currentConversation = null;
            currentAgents = [];
            msgs = [];
        }
        renderConversationList(conversationsCache);
        if (conversationsCache.length === 0) {
            const newConv = await createConversation();
            if (newConv) {
                conversationsCache = [newConv];
                renderConversationList(conversationsCache);
                await switchConversation(newConv.id, newConv);
            }
        } else if (!currentConversationId) {
            await switchConversation(conversationsCache[0].id, conversationsCache[0]);
        }
    } catch (e) { console.error('❌ 删除会话异常:', e); updateCloudStatusUI(false); }
}

async function saveMessageToCloud(msg) {
    if (!USER_ID || !currentConversationId) return;
    try {
        const rt = msg.reasoning_time;
        const t = msg.tokens;
        let tokensPayload = null;

        if (typeof t === 'object' && t !== null) {
            tokensPayload = Object.assign({}, t);
        } else if (typeof t === 'number') {
            tokensPayload = { total_tokens: t };
        }

        if (rt !== undefined && rt !== null) {
            if (!tokensPayload) tokensPayload = {};
            tokensPayload._reasoning_time = rt;
        }

        const payload = {
            user_id: USER_ID,
            conversation_id: currentConversationId,
            local_id: msg.local_id,
            role: msg.role,
            content: msg.content,
            reasoning: msg.reasoning || null,
            tokens: tokensPayload,
            parent_id: msg.parent_id || null,
            sibling_order: msg.sibling_order || 0,
            agent_id: msg.agent_id || null
        };
        const { error } = await supabaseClient.from('chat_messages').upsert(payload, { onConflict: 'local_id' });
        if (error) {
            console.error('❌ 消息同步失败:', error.message);
            updateCloudStatusUI(false);
            throw new Error(error.message);
        } else updateCloudStatusUI(true);
    } catch (e) {
        console.error('❌ 消息同步异常:', e);
        updateCloudStatusUI(false);
        throw e;
    }
}

async function loadMessagesFromCloud(targetNodeId = null) {
    if (!USER_ID || !currentConversationId) return { pathMsgs: [], leafId: null };

    const { data, error } = await supabaseClient.from('chat_messages')
        .select('id, role, content, reasoning, local_id, tokens, created_at, parent_id, sibling_order, agent_id')
        .eq('user_id', USER_ID)
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true });

    if (error) { updateCloudStatusUI(false); throw new Error('拉取记录失败: ' + error.message); }

    const allMsgs = data || [];
    if (allMsgs.length === 0) return { pathMsgs: [], leafId: null };

    const msgMap = new Map();
    allMsgs.forEach(m => msgMap.set(m.local_id, m));

    let startNodeId = targetNodeId;
    if (!startNodeId) {
        if (currentConversation && currentConversation.is_system_fixed) {
            try {
                const saved = localStorage.getItem('rp_fixed_leaf_' + USER_ID + '_' + currentConversationId);
                if (saved && msgMap.has(saved)) startNodeId = saved;
            } catch(e) {}
        } else {
            const { data: convData } = await supabaseClient.from('conversations')
                .select('active_leaf_id').eq('id', currentConversationId).single();
            startNodeId = convData?.active_leaf_id;
        }
    }
    if (!startNodeId || !msgMap.has(startNodeId)) {
        startNodeId = allMsgs[allMsgs.length - 1].local_id;
    }

    const childrenMap = new Map();
    allMsgs.forEach(m => {
        if (m.parent_id && m.parent_id !== m.local_id && msgMap.has(m.parent_id)) {
            if (!childrenMap.has(m.parent_id)) childrenMap.set(m.parent_id, []);
            childrenMap.get(m.parent_id).push(m);
        }
    });

    let targetLeafId = startNodeId;
    const visited = new Set();
    while (childrenMap.has(targetLeafId) && !visited.has(targetLeafId)) {
        visited.add(targetLeafId);
        const children = childrenMap.get(targetLeafId);
        children.sort((a, b) => (a.sibling_order || 0) - (b.sibling_order || 0));
        targetLeafId = children[children.length - 1].local_id;
    }

    const rawPath = [];
    let currId = targetLeafId;
    const backtrackVisited = new Set();
    while (currId && !backtrackVisited.has(currId)) {
        backtrackVisited.add(currId);
        const node = msgMap.get(currId);
        if (!node) break;
        rawPath.unshift(node);
        if (node.parent_id === node.local_id) break;
        currId = node.parent_id;
    }

    if (currentConversation && currentConversation.is_system_fixed) {
        try { localStorage.setItem('rp_fixed_leaf_' + USER_ID + '_' + currentConversationId, targetLeafId); } catch(e) {}
    } else {
        supabaseClient.from('conversations').update({ active_leaf_id: targetLeafId }).eq('id', currentConversationId).then();
    }

    const finalMsgs = rawPath.map((m, i) => {
        const trueParentId = i > 0 ? rawPath[i - 1].local_id : null;

        let siblings = allMsgs.filter(x => {
            if (x.local_id === m.local_id) return true;
            if (x.parent_id === x.local_id) return false;
            if (trueParentId === null) {
                return !x.parent_id || !msgMap.has(x.parent_id);
            }
            return x.parent_id === trueParentId;
        });

        siblings.sort((a, b) => (a.sibling_order || 0) - (b.sibling_order || 0));
        const sibIndex = siblings.findIndex(x => x.local_id === m.local_id);

        let restoredReasoningTime = null;
        if (m.tokens && typeof m.tokens === 'object' && m.tokens._reasoning_time !== undefined && m.tokens._reasoning_time !== null) {
            restoredReasoningTime = m.tokens._reasoning_time;
        } else if (m.reasoning_time !== undefined && m.reasoning_time !== null) {
            restoredReasoningTime = m.reasoning_time;
        }

        return {
            role: m.role,
            content: m.content,
            reasoning: m.reasoning,
            local_id: m.local_id,
            tokens: m.tokens,
            parent_id: trueParentId,
            _raw_parent_id: m.parent_id || null,
            agent_id: m.agent_id,
            reasoning_time: restoredReasoningTime,
            _sibTotal: siblings.length,
            _sibIndex: sibIndex >= 0 ? sibIndex : 0,
            _siblings: siblings
        };
    });

    return { pathMsgs: finalMsgs, leafId: targetLeafId };
}

async function refreshCurrentChat() {
    if (busy || !currentConversationId) return;
    if (Date.now() < ignoreRefreshUntil) return;
    try {
        const res = await loadMessagesFromCloud(activeLeafId);
        if (busy || Date.now() < ignoreRefreshUntil) return;
        msgs = res.pathMsgs;
        activeLeafId = res.leafId;
        msgBox.innerHTML = '';
        msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
        scrollBottom(true);
    } catch (e) { console.warn('
                                   } catch (e) { console.warn('实时刷新失败:', e); }
}

let realtimeChannel = null;
function setupRealtimeListener() {
    if (!USER_ID) return;
    if (realtimeChannel) supabaseClient.removeChannel(realtimeChannel);

    realtimeChannel = supabaseClient
        .channel('public:chat_messages')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'chat_messages', filter: `user_id=eq.${USER_ID}` },
            (payload) => {
                if (payload.new && payload.new.conversation_id === currentConversationId) refreshCurrentChat();
            }
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') console.log('📡 实时同步已开启');
        });
}

function updateGlobalUI() {
  if ($('#apiBase')) $('#apiBase').value = cfg.apiBase || '';
  if ($('#apiKey')) $('#apiKey').value = cfg.apiKey || '';
  if ($('#model')) $('#model').value = cfg.model || '';
  if ($('#temperature')) $('#temperature').value = cfg.temperature;
  if ($('#maxTokens')) $('#maxTokens').value = cfg.maxTokens;
  if ($('#ctxLimit')) $('#ctxLimit').value = cfg.ctxLimit;
  if ($('#userName')) $('#userName').value = cfg.userName;
  if ($('#userPrompt')) $('#userPrompt').value = cfg.userPrompt;
  if ($('#tempVal')) $('#tempVal').textContent = Number(cfg.temperature).toFixed(2);
}

function formatConvDate(dateStr) {
    if (!dateStr) return '更早';
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (dDay.getTime() === today.getTime()) return '今天';
    if (dDay.getTime() === yesterday.getTime()) return '昨天';
    const diffDays = Math.floor((today - dDay) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
        const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
        return weekdays[d.getDay()];
    }
    if (d.getFullYear() === now.getFullYear()) {
        return `${d.getMonth() + 1}月${d.getDate()}日`;
    }
    return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

// ★ 调整排序：固定对话在最上，其后是普通置顶，再是时间分组
function renderConversationList(convs) {
    const container = $('#conversationListContainer');
    if (!container) return;
    container.innerHTML = '';
    if (!convs || convs.length === 0) {
        container.innerHTML = '<div class="muted" style="text-align:center; padding:60px 20px; font-size:calc(13px * var(--font-scale));">还没有会话<br><br>点击右上角 ＋ 新建会话</div>';
        return;
    }
    const fixedConvs   = convs.filter(c => c.is_system_fixed);
    const pinnedConvs  = convs.filter(c => !c.is_system_fixed && c.is_pinned);
    const unpinnedConvs= convs.filter(c => !c.is_system_fixed && !c.is_pinned);

    // 1. 固定对话（最上方）
    if (fixedConvs.length > 0) {
        const title = document.createElement('div');
        title.className = 'conv-group-title';
        title.textContent = '⭐ 固定对话';
        container.appendChild(title);
        fixedConvs.forEach(c => container.appendChild(createConvItem(c)));
    }

    // 2. 其他置顶（在固定对话下面）
    if (pinnedConvs.length > 0) {
        const title = document.createElement('div');
        title.className = 'conv-group-title';
        title.textContent = '置顶';
        container.appendChild(title);
        pinnedConvs.forEach(c => container.appendChild(createConvItem(c)));
    }

    // 3. 历史分组
    const groups = {};
    unpinnedConvs.forEach(c => {
        const groupName = formatConvDate(c.created_at);
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(c);
    });
    Object.keys(groups).forEach(groupName => {
        const title = document.createElement('div');
        title.className = 'conv-group-title';
        title.textContent = groupName;
        container.appendChild(title);
        groups[groupName].forEach(c => container.appendChild(createConvItem(c)));
    });
}

// ★ 所有人点击都能进，且不再有锁图标，左侧显示星星
function createConvItem(c) {
    const item = document.createElement('div');
    item.className = 'conv-item';
    if (c.id === currentConversationId) item.classList.add('active');
    item.setAttribute('data-id', c.id);
    const displayName = (c.agents && c.agents.length > 0) ? c.agents[0].name : (c.agent_name || '未命名');
    
    // 固定对话统一加星星在最左边
    const starPrefix = c.is_system_fixed
        ? '<span style="margin-right:8px; color:var(--vip-gold); font-size:15px; flex-shrink:0;">⭐</span>'
        : '';

    if (isMultiSelectMode) {
        const isChecked = selectedConvs.has(c.id);
        item.innerHTML = `
            <div style="display:flex; align-items:center; width:100%; gap:12px;">
                <input type="checkbox" ${isChecked ? 'checked' : ''} ${c.is_system_fixed ? 'disabled' : ''} style="pointer-events:none; width:18px; height:18px; margin:0;">
                ${starPrefix}<span class="conv-name">${escapeHtml(displayName)}</span>
            </div>
        `;
    } else {
        item.innerHTML = `${starPrefix}<span class="conv-name">${escapeHtml(displayName)}</span>`;
    }

    let pressTimer = null;
    let isLongPress = false;
    let pressStartX = 0, pressStartY = 0;

    const startPress = (e) => {
        if (isMultiSelectMode) return;
        if (c.is_system_fixed) return; // 固定对话不可长按弹菜单
        isLongPress = false;
        if (e.touches && e.touches.length > 0) {
            pressStartX = e.touches[0].clientX;
            pressStartY = e.touches[0].clientY;
        } else {
            pressStartX = e.clientX;
            pressStartY = e.clientY;
        }
        pressTimer = setTimeout(() => {
            isLongPress = true;
            showContextMenuAt(pressStartX, pressStartY, c, displayName);
        }, 500);
    };
    const cancelPress = () => { if (pressTimer) clearTimeout(pressTimer); };

    item.addEventListener('touchstart', startPress, { passive: true });
    item.addEventListener('touchend', cancelPress);
    item.addEventListener('touchmove', cancelPress);
    item.addEventListener('mousedown', startPress);
    item.addEventListener('mouseup', cancelPress);
    item.addEventListener('mouseleave', cancelPress);
    item.addEventListener('contextmenu', (e) => {
        if (isMultiSelectMode) return;
        if (c.is_system_fixed) { e.preventDefault(); return; }
        e.preventDefault();
        showContextMenuAt(e.clientX, e.clientY, c, displayName);
    });
    item.addEventListener('click', (e) => {
        if (isMultiSelectMode) { toggleSelectConv(c.id); return; }
        if (isLongPress) { e.preventDefault(); return; }
        
        // ★ 不再有非会员拦截，所有人直接进
        switchConversation(c.id, c);
        closeSidebar();
    });
    return item;
}

function showContextMenuAt(clientX, clientY, conv, displayName) {
    const menu = document.getElementById('context-menu');
    if (!menu) return;
    const menuWidth = 150;
    const menuHeight = 200;
    let left = clientX;
    let top = clientY;
    if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 10;
    if (top + menuHeight > window.innerHeight) top = window.innerHeight - menuHeight - 10;
    menu.style.left = Math.max(10, left) + 'px';
    menu.style.top = Math.max(10, top) + 'px';
    menu.dataset.convId = conv.id;
    menu.dataset.convName = displayName;
    menu.dataset.isPinned = conv.is_pinned ? 'true' : 'false';
    const pinSpan = menu.querySelector('#cm-pin span');
    if (pinSpan) pinSpan.textContent = conv.is_pinned ? '取消置顶' : '置顶';
    menu.classList.add('show');
}

function toggleMultiSelectMode(enable) {
    isMultiSelectMode = enable;
    if (!enable) selectedConvs.clear();
    const newBtn = document.getElementById('newConvBtn');
    const cancelBtn = document.getElementById('multiCancelBtn');
    const deleteBtn = document.getElementById('multiDeleteBtn');
    const title = document.getElementById('sidebarTitle');
    if (enable) {
        newBtn.style.display = 'none';
        cancelBtn.style.display = 'block';
        deleteBtn.style.display = 'block';
        title.textContent = '已选 0 项';
        title.style.display = 'block';
    } else {
        newBtn.style.display = 'block';
        cancelBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        title.textContent = '';
        title.style.display = 'none';
    }
    renderConversationList(conversationsCache);
}

function updateMultiSelectCount() {
    if (isMultiSelectMode) {
        document.getElementById('sidebarTitle').textContent = `已选 ${selectedConvs.size} 项`;
    }
}

function toggleSelectConv(convId) {
    const c = conversationsCache.find(x => x.id === convId);
    if (c && c.is_system_fixed) return;
    if (selectedConvs.has(convId)) selectedConvs.delete(convId);
    else selectedConvs.add(convId);
    updateMultiSelectCount();
    renderConversationList(conversationsCache);
}

async function deleteSelectedConvs() {
    if (selectedConvs.size === 0) { alert('请先选择会话'); return; }
    const ids = Array.from(selectedConvs).filter(id => {
        const c = conversationsCache.find(x => x.id === id);
        return c && !c.is_system_fixed;
    });
      if (ids.length === 0) { alert('选中的都是系统固定对话，不可删除'); return; }
    if (!confirm(`确定要删除选中的 ${ids.length} 个会话吗？此操作不可恢复。`)) return;
    const btn = document.getElementById('multiDeleteBtn');
    btn.textContent = '删除中...';
    btn.disabled = true;
    try {
        await supabaseClient.from('conversations').delete().in('id', ids);
        await supabaseClient.from('chat_messages').delete().in('conversation_id', ids);
        isMultiSelectMode = false;
        selectedConvs.clear();
        conversationsCache = await loadConversations();
        if (!conversationsCache.find(c => c.id === currentConversationId)) {
            currentConversationId = conversationsCache.length > 0 ? conversationsCache[0].id : null;
        }
        document.getElementById('newConvBtn').style.display = 'block';
        document.getElementById('multiCancelBtn').style.display = 'none';
        btn.style.display = 'none';
        btn.textContent = '删除';
        btn.disabled = false;
        document.getElementById('sidebarTitle').textContent = '';
        document.getElementById('sidebarTitle').style.display = 'none';
        renderConversationList(conversationsCache);
        if (currentConversationId) {
            const target = conversationsCache.find(c => c.id === currentConversationId);
            await switchConversation(currentConversationId, target);
        } else {
            const newConv = await createConversation();
            if (newConv) {
                conversationsCache = [newConv];
                renderConversationList(conversationsCache);
                await switchConversation(newConv.id, newConv);
            }
        }
    } catch(e) {
        console.error('批量删除失败', e);
        alert('批量删除失败: ' + e.message);
        btn.textContent = '删除';
        btn.disabled = false;
    }
}

async function renameConversation(convId, oldName) {
    const c = conversationsCache.find(x => x.id === convId);
    if (c && c.is_system_fixed) return;
    const newName = prompt('请输入新的会话名称', oldName);
    if (!newName || newName.trim() === '' || newName === oldName) return;
    try {
        const conv = conversationsCache.find(c => c.id === convId);
        if (!conv) return;
        if (!conv.agents || conv.agents.length === 0) {
            conv.agents = [{ id: 'default', name: newName.trim(), prompt: '', greeting: '', avatar: '' }];
        } else {
            conv.agents[0].name = newName.trim();
        }
        await supabaseClient.from('conversations').update({
            agent_name: newName.trim(),
            agents: conv.agents
        }).eq('id', convId);
        conv.agent_name = newName.trim();
        renderConversationList(conversationsCache);
        if (currentConversationId === convId) {
            updateCurrentConversationUI(conv);
        }
    } catch(e) {
        console.error('重命名失败', e);
        alert('重命名失败');
    }
}

function renderAgentSelector() {
    const container = $('#agent-selector-bar');
    if (!container) return;
    container.innerHTML = '';
    currentAgents.forEach(agent => {
        const item = document.createElement('div');
        item.className = 'agent-select-item' + (agent.id === currentAgentId ? ' active' : '');
        item.innerHTML = `<div class="name">${escapeHtml(agent.name)}</div>`;
        item.addEventListener('click', () => {
            currentAgentId = agent.id;
            renderAgentSelector();
        });
        container.appendChild(item);
    });
}

function updateCurrentConversationUI(conv) {
    if (!conv) return;
    if ($('#headName')) {
        $('#headName').textContent = (conv.agents && conv.agents.length > 0) ? `${conv.agents[0].name}` : (conv.agent_name || '聊天');
    }
    document.querySelectorAll('.conv-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-id') === conv.id);
    });
}

let currentFetchId = 0;
async function switchConversation(convId, convObj = null) {
    if (busy) { alert('请等待当前回复生成完成后再切换。'); return; }

    const conv = convObj || conversationsCache.find(c => c.id === convId) || { id: convId };
    
    // ★ 去掉后备拦截，所有人都能进

    const fetchId = ++currentFetchId;
    currentConversationId = convId;
    if (USER_ID) { try { localStorage.setItem('rp_last_conv_' + USER_ID, convId); } catch(e){} }

    msgs = [];
    activeLeafId = null;
    cancelEditMode();

    if (!conv.agents || conv.agents.length === 0) {
        conv.agents = [{
            id: 'default_agent',
            name: conv.agent_name || '角色',
            prompt: conv.agent_prompt || '',
            greeting: conv.greeting || '',
            avatar: conv.avatar || ''
        }];
    }
    currentConversation = conv;
    currentAgents = conv.agents;
    if (!currentAgentId || !currentAgents.find(a => a.id === currentAgentId)) {
        currentAgentId = currentAgents[0].id;
    }

    updateCurrentConversationUI(conv);
    renderAgentSelector();
    msgBox.innerHTML = '<div class="muted" style="text-align:center;margin:auto;font-size:calc(13px * var(--font-scale));">正在加载聊天记录...</div>';

    try {
        let cloudRes = null;
        let lastErr = null;
        for (let attempt = 0; attempt < 3; attempt++) {
            if (fetchId !== currentFetchId) return;
            try {
                cloudRes = await loadMessagesFromCloud();
                lastErr = null;
                break;
            } catch (e) {
                lastErr = e;
                console.warn(`[switchConversation] 第 ${attempt + 1} 次加载失败:`, e.message);
                await new Promise(r => setTimeout(r, 300 * (attempt + 1)));
            }
        }
        if (fetchId !== currentFetchId) return;
        if (lastErr) throw lastErr;

        if (cloudRes.pathMsgs.length > 0) {
            msgs = cloudRes.pathMsgs;
            activeLeafId = cloudRes.leafId;
            msgBox.innerHTML = '';
            msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
        } else {
            msgBox.innerHTML = '';
            let hasGreeting = false;
            for (let agent of currentAgents) {
                if (agent.greeting && agent.greeting.trim()) {
                    const aiMsg = { role: 'assistant', content: agent.greeting, local_id: generateId(), parent_id: null, sibling_order: Date.now(), agent_id: agent.id };
                    msgs.push(aiMsg);
                    await saveMessageToCloud(aiMsg);
                    addBubble('assistant', agent.greeting, msgs.length - 1, null, null, agent.id);
                    hasGreeting = true;
                }
            }
            if (hasGreeting) {
                activeLeafId = msgs[msgs.length - 1].local_id;
                await persistActiveLeafId(activeLeafId);
            } else {
                msgBox.innerHTML = '<div class="muted" style="text-align:center;margin:auto;font-size:calc(13px * var(--font-scale));">发送一条消息开始对话吧。</div>';
            }
        }
    } catch (e) {
        console.error("切换会话加载异常:", e);
        if (fetchId === currentFetchId) {
            msgBox.innerHTML = '<div class="err" style="text-align:center;margin:auto;">加载失败：' + escapeHtml(e.message) +
                '<br><button class="btn sm" id="retryLoadBtn" style="margin-top:10px;">重试</button></div>';
            const rb = $('#retryLoadBtn');
            if (rb) rb.onclick = () => switchConversation(convId, conv);
        }
    } finally {
        if (fetchId === currentFetchId) scrollBottom(true);
    }
}

async function autoOpenLastConversation() {
    if (!conversationsCache || conversationsCache.length === 0) return;
    let lastId = null;
    try { lastId = localStorage.getItem('rp_last_conv_' + USER_ID); } catch(e) {}
    let target = conversationsCache.find(c => c.id === lastId);
    // ★ 去掉权限拦截判断
    if (!target) target = conversationsCache[0];
    if (target) await switchConversation(target.id, target);
}

function updateVersionSwitcher(index, msg) {
    const msgRow = msgBox.querySelector(`.msg[data-msg-index="${index}"]`);
    if (!msgRow) return;
    const actionsDiv = msgRow.querySelector('.msg-actions');
    if (!actionsDiv) return;
    const oldSwitcher = actionsDiv.querySelector('.version-switcher');
    if (oldSwitcher) oldSwitcher.remove();

    if (msg._sibTotal > 1) {
        const switcher = document.createElement('div');
        switcher.className = 'version-switcher';
        switcher.innerHTML = `
            <button class="version-btn" data-msg-index="${index}" data-direction="-1" ${msg._sibIndex === 0 ? 'disabled' : ''}>&lt;</button>
            <span>${msg._sibIndex + 1}/${msg._sibTotal}</span>
            <button class="version-btn" data-msg-index="${index}" data-direction="1" ${msg._sibIndex === msg._sibTotal - 1 ? 'disabled' : ''}>&gt;</button>
        `;
        const regenBtn = actionsDiv.querySelector('.regen-btn');
        if (regenBtn) actionsDiv.insertBefore(switcher, regenBtn);
        else actionsDiv.appendChild(switcher);
    }
}

function addBubble(role, content, index = null, tokens = null, reasoning = null, agentId = null, insertBeforeNode = null){
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + role;
  if (index !== null) wrap.setAttribute('data-msg-index', index);

  let name = '';
  let avatarHtml = '';
  if (role === 'user') {
      name = cfg.userName || '你';
      avatarHtml = getUserAvatarHtml();
  } else {
      const agent = currentAgents.find(a => a.id === agentId) || currentAgents[0];
      name = agent ? agent.name : '角色';
      avatarHtml = getAvatarHtml(agentId || (agent ? agent.id : null));
  }

  let actionsHtml = '';
  if (role === 'assistant') {
      if (isFeatureEnabled) {
          actionsHtml += `<button class="action-btn regen-btn" title="重新生成" data-msg-index="${index}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path></svg>
          </button>`;
          actionsHtml += `<button class="action-btn continue-btn" title="继续生成" data-msg-index="${index}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
          </button>`;
          actionsHtml += `<button class="action-btn edit-btn" title="编辑" data-msg-index="${index}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
          </button>`;
          actionsHtml += `
              <div class="more-actions-wrap">
                  <button class="action-btn more-btn" title="更多" data-msg-index="${index}">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                  <div class="more-menu">
                      <button class="delete-btn" data-msg-index="${index}">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                          删除
                      </button>
                  </div>
              </div>
          `;
      } else {
          actionsHtml += `<button class="action-btn regen-btn" data-msg-index="${index}">重新生成</button>`;
          actionsHtml += `<button class="action-btn continue-btn" data-msg-index="${index}">继续生成</button>`;
          actionsHtml += `<button class="action-btn edit-btn" data-msg-index="${index}">编辑</button>`;
          actionsHtml += `<button class="action-btn delete-btn" data-msg-index="${index}">删除</button>`;
      }
  }

  let tokenHtml = '';
  if (tokens && role === 'assistant') {
      let totalVal = 0;
      if (typeof tokens === 'object' && tokens !== null) totalVal = tokens.total_tokens || 0;
      else if (typeof tokens === 'number') totalVal = tokens;
      if (totalVal > 0) tokenHtml = `<span class="token-display" title="总 Token: ${totalVal}">T: ${totalVal}</span>`;
  }

  let reasoningHtml = '';
  if (role === 'assistant' && reasoning) {
      const rt = (msgs[index] && msgs[index].reasoning_time !== undefined && msgs[index].reasoning_time !== null)
                  ? msgs[index].reasoning_time
                  : null;
      const timeStr = (rt !== null) ? `（用时 ${rt} 秒）` : '';
      reasoningHtml = `
        <div class="reasoning-box collapsed">
            <div class="reasoning-header">
                <span class="reasoning-label">已思考${timeStr}</span>
                <svg class="arrow-icon right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>
            </div>
            <div class="reasoning-content">${escapeHtml(reasoning)}</div>
        </div>`;
  }

  const isVipDisplay = role === 'user' && currentVipStatus.is_vip;

  if (role === 'assistant') {
      wrap.innerHTML = `
        <div class="msg-header">
          <div class="avatar">${avatarHtml}</div>
          <div class="meta">${escapeHtml(name)}</div>
        </div>
        <div class="content-wrap" style="width:100%;">
            ${reasoningHtml}
            <div class="content"></div>
        </div>
        <div class="msg-actions">${actionsHtml}${tokenHtml}</div>`;
  } else {
      wrap.innerHTML = `
        <div class="msg-header">
          <div class="meta">${escapeHtml(name)} ${isVipDisplay ? '<span class="vip-icon">👑</span>' : ''}</div>
          <div class="avatar">${avatarHtml}</div>
        </div>
        <div class="content"></div>
        <div class="msg-actions"></div>`;
  }

  let isAttachmentMsg = false;
  let attachmentData = null;
  if (role === 'user') {
      try {
          const parsed = JSON.parse(content);
          if (parsed && parsed._type === 'attachment') {
              isAttachmentMsg = true;
              attachmentData = parsed;
          }
      } catch (e) {}
  }

  if (isAttachmentMsg) {
      const contentEl = wrap.querySelector('.content');
      contentEl.classList.add('has-attachment');
      let html = '';
      if (attachmentData.files && attachmentData.files.length > 0) {
          attachmentData.files.forEach(f => {
              html += `
              <div class="bubble-file-card">
                  <div class="file-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <div class="file-info">
                      <div class="file-name">${escapeHtml(f.name)}</div>
                      <div class="file-size">${escapeHtml(f.size || '未知')}</div>
                  </div>
              </div>`;
          });
      }
      if (attachmentData.text) {
          html += `<div class="text-bubble">${renderContent(attachmentData.text, false)}</div>`;
      }
      contentEl.innerHTML = html;
  } else {
      wrap.querySelector('.content').innerHTML = renderContent(content, false);
  }

  if (insertBeforeNode && insertBeforeNode.parentNode === msgBox) {
      msgBox.insertBefore(wrap, insertBeforeNode);
  } else {
      msgBox.appendChild(wrap);
  }

  if (role === 'user' && index !== null) {
      const contentEl = wrap.querySelector('.content');
      contentEl.addEventListener('click', (e) => {
          if (window.getSelection().toString() === '') {
              openEditModal(index);
          }
      });
  }

  if (reasoningHtml) {
      const rBox = wrap.querySelector('.reasoning-box');
      const rHeader = wrap.querySelector('.reasoning-header');
      if (rBox && rHeader) {
          rHeader.addEventListener('click', () => rBox.classList.toggle('collapsed'));
      }
  }

  if (index !== null) {
      const msg = msgs[index];
      if (msg && msg._sibTotal > 1) updateVersionSwitcher(index, msg);
  }
  scrollBottom(true);
  return wrap;
}

function scrollBottom(force){
  if(!force){
    const near = msgBox.scrollHeight - msgBox.scrollTop - msgBox.clientHeight < 160;
    if(!near) return;
  }
  msgBox.scrollTop = msgBox.scrollHeight;
}

function endpoint(){
  let base = String(cfg.apiBase || '').trim().replace(/\/+$/, '');
  if(!base) throw new Error('请先在设置中填写 API 地址');
  if(/\/chat\/completions$/i.test(base)) return base;
  return base + '/chat/completions';
}

function systemPrompt() {
  const agent = currentAgents.find(a => a.id === currentAgentId) || currentAgents[0];
  const promptText = agent ? agent.prompt : '';
  const agentName = agent ? agent.name : 'AI';
  const parts = [];
  parts.push(`你现在正在一个多人聊天群组中，你的角色是【${agentName}】。`);
  parts.push(`【角色设定】\n${promptText}`);
  parts.push(`【群聊规则】\n1. 对话历史中，带有【用户】或【其他角色名】前缀的内容，是别人说的话。\n2. 只有没有前缀的内容，才是你自己（${agentName}）之前说的话。\n3. 请根据当前群聊的上下文，用你角色的性格、口吻进行回复。\n4. 【绝对指令】直接输出你的对话和动作，千万不要在你回复的开头加上你自己的名字（如"${agentName}："），系统已经知道你是谁了。`);
  parts.push('【格式规范】你支持标准的 Markdown 与 LaTeX 语法。可以使用 **加粗**、*斜体*、`代码块` 以及标准的 LaTeX 公式（例如：$\\textbf{加粗文字}$、$\\color{red}{红色文字}$、$\\frac{1}{2}$ 等）。动作、神态和环境描写请使用反引号 ` 包裹，或者直接使用普通段落描写。');
  if ($('#deepThinkBtn').classList.contains('active')) parts.push('【深度思考已开启】请在进行回复前，进行极其详细的心理、逻辑和剧情推演，然后再输出正文。');
  if ($('#searchBtn').classList.contains('active')) parts.push('【智能搜索已开启】请结合你的广泛知识库，给出准确的事实和设定，避免出现常识性错误。');
  return parts.join('\n\n');
}

function buildMessages(contextMsgs){
  const limit = Math.max(2, Number(cfg.ctxLimit) || 30);
  const recentMsgs = contextMsgs.slice(-limit);
  const hist = recentMsgs.map(m => {
      if (m.role === 'user') {
          if (m._isContinue) {
              return { role: 'user', content: m.content };
          }
          let userContent = m.content;
          try {
              const parsed = JSON.parse(m.content);
              if (parsed && parsed._type === 'attachment') {
                  let fileStr = '';
                  if (parsed.files && parsed.files.length > 0) {
                      parsed.files.forEach(f => {
                          fileStr += `\n[文件内容开始：${f.name}]\n${f.content}\n[文件内容结束]\n`;
                      });
                  }
                  userContent = `【用户发送了附件】\n${fileStr}\n\n【用户的问题/留言】：\n${parsed.text || '（无文字描述）'}`;
              }
          } catch (e) {}
          return { role: 'user', content: `【${cfg.userName || '用户'}】说：${userContent}` };
      } else {
          const msgAgentId = m.agent_id || currentAgentId;
          if (msgAgentId === currentAgentId) {
              return { role: 'assistant', content: m.content };
          } else {
              const otherAgent = currentAgents.find(a => a.id === msgAgentId);
              const otherName = otherAgent ? otherAgent.name : '其他角色';
              return { role: 'user', content: `【${otherName}】说：${m.content}` };
          }
      }
  });
  return [{role:'system', content: systemPrompt()}].concat(hist);
}

async function fetchAIResponseStreaming(contextMsgs, onProgress) {
  const payload = { model: cfg.model, messages: buildMessages(contextMsgs), temperature: Number(cfg.temperature), max_tokens: Number(cfg.maxTokens), stream: true, stream_options: { include_usage: true } };
  const res = await fetch(endpoint(), {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (cfg.apiKey || '') },
    body: JSON.stringify(payload)
  });
  if(!res.ok){ const txt = await res.text().catch(() => ''); throw new Error('HTTP ' + res.status + ' ' + res.statusText + (txt ? '\n' + txt.slice(0, 500) : '')); }
  if(!res.body) throw new Error('该接口未返回可读流');

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let full = '', fullReasoning = '', buf = '', usage = null;

  while(true){
    const {done, value} = await reader.read();
    if(done) break;
    buf += decoder.decode(value, {stream: true});
    const lines = buf.split('\n');
    buf = lines.pop();
    for(const raw of lines){
      const line = raw.trim();
      if(!line || line.startsWith(':') || !line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if(data === '[DONE]') continue;
      let json; try{ json = JSON.parse(data); }catch(e){ continue; }
      if (json.usage) usage = json.usage;
      const choice = json.choices && json.choices[0];
      if(!choice) continue;
      const delta = choice.delta || {};
      const reasonDelta = delta.reasoning_content || '';
      const contentDelta = delta.content || '';
      if(reasonDelta) fullReasoning += reasonDelta;
      if(contentDelta) full += contentDelta;
      if (onProgress && (reasonDelta || contentDelta)) onProgress(full, fullReasoning);
    }
  }
  return { full, fullReasoning, usage };
}

function openEditModal(index) {
    if (busy) return;
    const msg = msgs[index];
    if (!msg) return;
    editingMsgIndex = index;
    let textToEdit = msg.content;
    pendingFiles = [];
    try {
        const parsed = JSON.parse(msg.content);
        if (parsed && parsed._type === 'attachment') {
            textToEdit = parsed.text || '';
            if (parsed.files) {
                parsed.files.forEach(f => {
                    pendingFiles.push({ name: f.name, content: f.content, type: 'text', file: {size: 0} });
                });
            }
        }
    } catch(e) {}
    $('#input').value = textToEdit;
    renderPendingFiles();
    $('#edit-input-header').style.display = 'flex';
    $('#agent-selector-bar').style.display = 'none';
    autoResize();
    $('#input').focus();
}

function cancelEditMode() {
    editingMsgIndex = null;
    $('#input').value = '';
    $('#edit-input-header').style.display = 'none';
    $('#agent-selector-bar').style.display = 'flex';
    pendingFiles = [];
    renderPendingFiles();
    autoResize();
}

async function saveEditedMessage() {
    if (busy || editingMsgIndex === null) return;
    const msg = msgs[editingMsgIndex];
    if (!msg) return;

    const text = $('#input').value.trim();
    if (text === '' && pendingFiles.length === 0) { cancelEditMode(); return; }

    let newContent = text;
    if (pendingFiles.length > 0) {
        const payload = {
            _type: "attachment",
            text: text,
            files: pendingFiles.map(f => ({
                name: f.name,
                size: f.file.size ? (f.file.size / 1024).toFixed(2) + 'KB' : (f.size || '未知'),
                content: f.content
            }))
        };
        newContent = JSON.stringify(payload);
    }

    const idxSnapshot = editingMsgIndex;

    if (msg.role === 'assistant') {
        if (newContent === msg.content) { cancelEditMode(); return; }
        busy = true; setBusyUI(true); cancelEditMode();
        try {
            const trueParentId = idxSnapshot > 0 ? msgs[idxSnapshot - 1].local_id : null;
            const newAiMsg = {
                role: 'assistant', content: newContent, local_id: generateId(),
                parent_id: trueParentId, sibling_order: Date.now(),
                agent_id: msg.agent_id || currentAgentId, reasoning: null, tokens: null
            };
            await saveMessageToCloud(newAiMsg);
            activeLeafId = newAiMsg.local_id;
            await persistActiveLeafId(activeLeafId);
            const res = await loadMessagesFromCloud(newAiMsg.local_id);
            msgs = res.pathMsgs; activeLeafId = res.leafId;
            msgBox.innerHTML = '';
            msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
        } catch (e) {
            console.error("编辑 AI 消息失败:", e);
            alert("编辑 AI 消息失败: " + e.message);
        } finally { busy = false; setBusyUI(false); }
        return;
    }

    if (newContent === msg.content) {
        cancelEditMode();
        let nextAiIdx = -1;
        for (let i = idxSnapshot + 1; i < msgs.length; i++) {
            if (msgs[i].role === 'assistant') { nextAiIdx = i; break; }
        }
        if (nextAiIdx >= 0) {
            await regenerateMessage(nextAiIdx);
        } else {
            busy = true; setBusyUI(true);
            try {
                const contextMsgs = msgs.slice(0, idxSnapshot + 1);
                await generateAIResponse(contextMsgs, msg.local_id, msg.agent_id);
            } catch (e) {
                console.error("生成失败:", e);
                busy = false; setBusyUI(false);
            }
        }
        return;
    }

    busy = true; setBusyUI(true); cancelEditMode();
    try {
        const trueParentId = idxSnapshot > 0 ? msgs[idxSnapshot - 1].local_id : null;
        if (msg._raw_parent_id !== undefined && msg._raw_parent_id !== trueParentId) {
            try {
                await supabaseClient.from('chat_messages').update({ parent_id: trueParentId }).eq('local_id', msg.local_id);
            } catch (e) { console.error('修复旧用户消息 parent_id 失败:', e); }
        }
        const newMsg = {
            role: msg.role, content: newContent, local_id: generateId(),
            parent_id: trueParentId, sibling_order: Date.now(), agent_id: msg.agent_id
        };
        await saveMessageToCloud(newMsg);
        activeLeafId = newMsg.local_id;
        await persistActiveLeafId(activeLeafId);
        const res = await loadMessagesFromCloud(newMsg.local_id);
        msgs = res.pathMsgs; activeLeafId = res.leafId;
        msgBox.innerHTML = '';
        msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
        const contextMsgs = msgs.slice();
        await generateAIResponse(contextMsgs, newMsg.local_id, newMsg.agent_id);
    } catch (e) {
        console.error("编辑消息失败:", e);
        alert("编辑消息失败: " + e.message);
        busy = false; setBusyUI(false);
    }
}

async function send(){
  if(busy || !currentConversationId) return;
  if (editingMsgIndex !== null) { await saveEditedMessage(); return; }

  const input = $('#input');
  const text = input.value.trim();

  let contentToSend = text;
  if (pendingFiles.length > 0) {
      const payload = {
          _type: "attachment",
          text: text,
          files: pendingFiles.map(f => ({
              name: f.name,
              size: f.file.size ? (f.file.size / 1024).toFixed(2) + 'KB' : (f.size || '未知'),
              content: f.content
          }))
      };
      contentToSend = JSON.stringify(payload);
  }

  if(!contentToSend) return;

  busy = true;
  setBusyUI(true);
  input.value = ''; autoResize();
  pendingFiles = [];
  renderPendingFiles();

  try {
      const userMsg = { role: 'user', content: contentToSend, local_id: generateId(), parent_id: activeLeafId, sibling_order: Date.now() };
      msgs.push(userMsg);
      addBubble('user', contentToSend, msgs.length - 1);
      await saveMessageToCloud(userMsg);
      activeLeafId = userMsg.local_id;
      await persistActiveLeafId(activeLeafId);
      await generateAIResponse(msgs.slice(0, -1).concat(userMsg), userMsg.local_id);
  } catch(e) {
      console.error("发送失败:", e);
      alert("发送失败: " + e.message);
      busy = false; setBusyUI(false);
  }
}

async function generateAIResponse(contextMsgs, parentId, agentId = null, replaceMsgIndex = null) {
  busy = true; setBusyUI(true);

  const actualParentId = parentId !== undefined ? parentId : activeLeafId;
  const actualAgentId = agentId || currentAgentId;
  const deepThinkActive = $('#deepThinkBtn').classList.contains('active');
  const MIN_THINK_SEC = 10;

  let insertBeforeNode = null;
  if (replaceMsgIndex !== null) {
      const oldBubble = msgBox.querySelector(`.msg[data-msg-index="${replaceMsgIndex}"]`);
      if (oldBubble) {
          insertBeforeNode = oldBubble.nextSibling;
          oldBubble.remove();
      }
  }

  const aiMsg = {
      role: 'assistant', content: '', reasoning: '', local_id: generateId(), tokens: null,
      parent_id: actualParentId, sibling_order: Date.now(), agent_id: actualAgentId,
      reasoning_time: null,
      _sibTotal: 1, _sibIndex: 0, _siblings: []
  };
  const aiMsgIndex = msgs.length;
  msgs.push(aiMsg);

  const bubble = addBubble('assistant', '', aiMsgIndex, null, null, actualAgentId, insertBeforeNode);
  const contentEl = bubble.querySelector('.content');
  const contentWrap = bubble.querySelector('.content-wrap');

  const rBox = document.createElement('div');
  rBox.className = 'reasoning-box';
  rBox.innerHTML = `
      <div class="reasoning-header thinking">
          <span class="reasoning-label">正在思考</span>
          <svg class="arrow-icon up-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"></path></svg>
      </div>
      <div class="reasoning-content"></div>
  `;
  contentWrap.insertBefore(rBox, contentEl);

  const rHeader = rBox.querySelector('.reasoning-header');
  const rLabel = rBox.querySelector('.reasoning-label');
  const rContent = rBox.querySelector('.reasoning-content');
  const rIcon = rBox.querySelector('.arrow-icon');
  rHeader.addEventListener('click', () => rBox.classList.toggle('collapsed'));

  contentEl.innerHTML = '<span class="cursor"></span>';

  await saveMessageToCloud(aiMsg);

  let lastCloudSave = Date.now();
  let reasoningSeconds = 0;
  let timerInterval = null;
  let hasStartedContent = false;
  let contentGated = false;
  let pendingContent = '';

  function releaseGate(finalSec) {
      contentGated = false;
      if (!hasStartedContent) {
          hasStartedContent = true;
          rHeader.classList.remove('thinking');
          rIcon.classList.remove('up-down');
          rIcon.classList.add('right');
          rIcon.innerHTML = '<path d="M9 18l6-6-6-6"></path>';
          rBox.classList.add('collapsed');
          rLabel.textContent = `已思考（用时 ${finalSec} 秒）`;
      }
      if (pendingContent) {
          contentEl.innerHTML = renderContent(pendingContent, true) + '<span class="cursor"></span>';
          pendingContent = '';
      }
  }

  timerInterval = setInterval(() => {
      reasoningSeconds++;
      if (contentGated && reasoningSeconds >= MIN_THINK_SEC) {
          releaseGate(reasoningSeconds);
      } else if (!hasStartedContent) {
          rLabel.textContent = `正在思考 (${reasoningSeconds} 秒)`;
      }
  }, 1000);

  try {
      const { full, fullReasoning, usage } = await fetchAIResponseStreaming(contextMsgs, (partialText, partialReasoning) => {
          if (partialReasoning) {
              rBox.classList.remove('collapsed');
              rContent.textContent = partialReasoning;
              aiMsg.reasoning = partialReasoning;
          }
          if (partialText) {
              aiMsg.content = partialText;
              if (deepThinkActive && reasoningSeconds < MIN_THINK_SEC) {
                  contentGated = true;
                  pendingContent = partialText;
              } else {
                  if (!hasStartedContent) {
                      hasStartedContent = true;
                      rHeader.classList.remove('thinking');
                      rIcon.classList.remove('up-down');
                      rIcon.classList.add('right');
                      rIcon.innerHTML = '<path d="M9 18l6-6-6-6"></path>';
                      rBox.classList.add('collapsed');
                      rLabel.textContent = `已思考（用时 ${reasoningSeconds} 秒）`;
                  }
                  contentEl.innerHTML = renderContent(partialText, true) + '<span class="cursor"></span>';
                  pendingContent = '';
              }
          }
          if (Date.now() - lastCloudSave > 2000) {
              saveMessageToCloud(aiMsg).catch(e => console.error(e));
              lastCloudSave = Date.now();
          }
      });

      if (full) {
          aiMsg.content = full;
          aiMsg.reasoning = fullReasoning;
      }

      if (contentGated) {
          const remainingMs = Math.max(0, (MIN_THINK_SEC - reasoningSeconds) * 1000);
          if (remainingMs > 0) {
              contentEl.innerHTML = '<span class="muted">正在整理回答…</span>';
              await new Promise(r => setTimeout(r, remainingMs + 80));
          }
          if (contentGated) releaseGate(Math.max(reasoningSeconds, MIN_THINK_SEC));
      }

      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      const finalSeconds = reasoningSeconds;

      if (rLabel) {
          rLabel.textContent = `已思考（用时 ${finalSeconds} 秒）`;
          rHeader.classList.remove('thinking');
          rIcon.classList.remove('up-down');
          rIcon.classList.add('right');
          rIcon.innerHTML = '<path d="M9 18l6-6-6-6"></path>';
          rBox.classList.add('collapsed');
      }

      if (full && full.trim()) {
          contentEl.innerHTML = renderContent(full, false);
          aiMsg.content = full;
          aiMsg.reasoning = fullReasoning;
          aiMsg.tokens = usage ? usage.total_tokens : null;
          aiMsg.reasoning_time = finalSeconds;

          if (usage && usage.total_tokens) {
              const existing = bubble.querySelector('.token-display');
              if (!existing) {
                  const tokenSpan = document.createElement('span');
                  tokenSpan.className = 'token-display';
                  tokenSpan.title = `完成 Token: ${usage.completion_tokens || 0} / 总 Token: ${usage.total_tokens}`;
                  tokenSpan.textContent = `T: ${usage.total_tokens}`;
                  bubble.querySelector('.msg-actions').appendChild(tokenSpan);
              }
          }
      } else if (!aiMsg.content) {
          contentEl.innerHTML = '<span class="muted">（模型返回了空内容）</span>';
          aiMsg.content = '（模型返回了空内容）';
          aiMsg.reasoning_time = finalSeconds;
      } else {
          aiMsg.reasoning_time = finalSeconds;
      }
  } catch (err) {
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      rHeader.classList.remove('thinking');
      rIcon.classList.remove('up-down');
      rIcon.classList.add('right');
      rIcon.innerHTML = '<path d="M9 18l6-6-6-6"></path>';
      rBox.classList.add('collapsed');
      rLabel.textContent = `已思考（用时 ${reasoningSeconds} 秒）`;
      contentEl.innerHTML = renderContent(aiMsg.content || '', false) + '<div class="err">请求中断或失败：' + escapeHtml(err.message) + '</div>';
      if (!aiMsg.content) aiMsg.content = '（请求失败）';
      aiMsg.reasoning_time = reasoningSeconds;
  } finally {
      try { await saveMessageToCloud(aiMsg); } catch(e) {}
      activeLeafId = aiMsg.local_id;
      await persistActiveLeafId(activeLeafId);

      if (replaceMsgIndex !== null) {
          try {
              const res = await loadMessagesFromCloud(aiMsg.local_id);
              msgs = res.pathMsgs; activeLeafId = res.leafId;
              msgBox.innerHTML = '';
              msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
          } catch (e) {
              console.error("刷新分支树失败:", e);
          }
      }

      ignoreRefreshUntil = Date.now() + 2000;
      busy = false; setBusyUI(false);
      scrollBottom(true);
  }
}

async function regenerateMessage(index) {
  if (busy) return;
  const msg = msgs[index];
  if (!msg || msg.role !== 'assistant') return;

  const trueParentId = index > 0 ? msgs[index - 1].local_id : null;
  const userMsgContext = index > 0 ? msgs.slice(0, index) : [];

  if (msg._raw_parent_id !== undefined && msg._raw_parent_id !== trueParentId) {
      try {
          await supabaseClient.from('chat_messages').update({ parent_id: trueParentId }).eq('local_id', msg.local_id);
      } catch (e) { console.error('修复旧AI消息 parent_id 失败:', e); }
  }

  if (!currentAgentId || !currentAgents.find(a => a.id === currentAgentId)) {
      currentAgentId = msg.agent_id || (currentAgents[0] ? currentAgents[0].id : null);
      renderAgentSelector();
  }

  await generateAIResponse(userMsgContext, trueParentId, msg.agent_id || currentAgentId, index);
}

async function continueGeneration(index) {
  if (busy) return;
  const msg = msgs[index];
  if (!msg || msg.role !== 'assistant') return;

  if (!currentAgentId || !currentAgents.find(a => a.id === currentAgentId)) {
      currentAgentId = msg.agent_id || (currentAgents[0] ? currentAgents[0].id : null);
      renderAgentSelector();
  }

  const contextMsgs = msgs.slice(0, index + 1).concat([{
      role: 'user',
      content: '（请自然地接着上面的内容继续往下说，不要重复已说过的内容，延续当前角色的语气与动作。）',
      _isContinue: true
  }]);

  await generateAIResponse(contextMsgs, msg.local_id, msg.agent_id || currentAgentId);
}

async function switchVersion(index, direction) {
  const msg = msgs[index];
  if (!msg || !msg._siblings) return;
  const newIndex = msg._sibIndex + direction;
  if (newIndex < 0 || newIndex >= msg._sibTotal) return;
  const targetSibling = msg._siblings[newIndex];
  if (!targetSibling) return;

  busy = true; setBusyUI(true);
  try {
      const res = await loadMessagesFromCloud(targetSibling.local_id);
      msgs = res.pathMsgs; activeLeafId = res.leafId;
      msgBox.innerHTML = '';
      msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
      scrollBottom(true);
  } catch(e) { console.error("切换分支失败:", e); }
  finally { busy = false; setBusyUI(false); }
}

async function deleteMessage(index) {
    if (busy) return;
    if (!confirm('确定要删除这条消息吗？删除后无法恢复。')) return;
    const msg = msgs[index];
    if (!msg) return;
    busy = true; setBusyUI(true);
    try {
        if (msg.local_id === activeLeafId && msg.parent_id) {
            activeLeafId = msg.parent_id;
            await persistActiveLeafId(activeLeafId);
        }
        await supabaseClient.from('chat_messages').delete().eq('local_id', msg.local_id);
        const res = await loadMessagesFromCloud(msg.parent_id);
        msgs = res.pathMsgs; activeLeafId = res.leafId;
        msgBox.innerHTML = '';
        msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
    } catch(e) { console.error("删除失败:", e); }
    finally { busy = false; setBusyUI(false); }
}

function setBusyUI(b){
  const btn = $('#sendBtn');
  if(btn) {
      const sendIcon = document.getElementById('sendIcon');
      const stopIcon = document.getElementById('stopIcon');
      if (b) {
          if(sendIcon) sendIcon.style.display = 'none';
          if(stopIcon) stopIcon.style.display = 'block';
          btn.classList.add('stop');
          btn.title = '停止';
      } else {
          if(sendIcon) sendIcon.style.display = 'block';
          if(stopIcon) stopIcon.style.display = 'none';
          btn.classList.remove('stop');
          btn.title = '发送';
      }
  }
  const newBtn = $('#newConvBtn');
  if(newBtn) newBtn.disabled = b;
}

function renderCharSettings() {
    const tabList = $('#agentTabList');
    if (!tabList) return;
    tabList.innerHTML = '';
    const isSystemConv = currentConversation && (currentConversation.is_system_fixed || currentConversation.is_hidden_prompt);

    currentAgents.forEach(agent => {
        const tab = document.createElement('div');
        tab.className = 'agent-tab' + (agent.id === editingAgentId ? ' active' : '');
        const deleteBtn = (!isSystemConv && currentAgents.length > 1)
            ? `<span class="del-agent" data-id="${agent.id}">✕</span>` : '';
        tab.innerHTML = `<span class="agent-tab-name">${escapeHtml(agent.name)}</span>${deleteBtn}`;
        tab.addEventListener('click', (e) => {
            if (e.target.classList.contains('del-agent')) {
                e.stopPropagation();
                if (isSystemConv) return;
                const delId = e.target.getAttribute('data-id');
                currentAgents = currentAgents.filter(a => a.id !== delId);
                if (editingAgentId === delId) editingAgentId = currentAgents[0].id;
                if (currentAgentId === delId) currentAgentId = currentAgents[0].id;
                renderCharSettings();
                return;
            }
            saveFormToCurrentAgent();
            editingAgentId = agent.id;
            renderCharSettings();
        });
        tabList.appendChild(tab);
    });

    const currentEditAgent = currentAgents.find(a => a.id === editingAgentId);
    if (currentEditAgent) {
        $('#modalCharName').value = currentEditAgent.name || '';
        $('#modalGreeting').value = currentEditAgent.greeting || '';
        const promptEl = $('#modalCharPrompt');
        // 无论是谁，只要进了固定对话，指令就锁死不可见
        if (isSystemConv) {
            promptEl.value = '';
            promptEl.disabled = true;
            promptEl.placeholder = '🔒 指令暂不可见（系统保护）';
        } else {
            promptEl.value = currentEditAgent.prompt || '';
            promptEl.disabled = false;
            promptEl.placeholder = '请在这里输入角色设定、世界观、说话风格等指令...';
        }
        updateAvatarPreview(currentEditAgent.avatar);
    }
    if ($('#chkHideAvatarName')) $('#chkHideAvatarName').checked = !!styleConfig.hideAvatarName;
}

function saveFormToCurrentAgent() {
    const agent = currentAgents.find(a => a.id === editingAgentId);
    if (agent) {
        agent.name = $('#modalCharName').value.trim() || '未命名';
        const isSystemConv = currentConversation && (currentConversation.is_system_fixed || currentConversation.is_hidden_prompt);
        if (!isSystemConv) {
            agent.prompt = $('#modalCharPrompt').value.trim();
        }
        agent.greeting = $('#modalGreeting').value.trim();
    }
}

function updateAvatarPreview(base64Str) {
    const preview = $('#avatarPreview');
    if (!preview) return;
    if (base64Str) preview.innerHTML = `<img src="${base64Str}" alt="avatar">`;
    else preview.innerHTML = `<span>🤖</span>`;
}
function updateUserAvatarPreview(base64Str) {
    const preview = $('#userAvatarPreview');
    if (!preview) return;
    if (base64Str) preview.innerHTML = `<img src="${base64Str}" alt="avatar">`;
    else preview.innerHTML = `<span>👤</span>`;
}

async function submitVipOrder() {
    const note = $('#paymentNoteInput').value.trim();
    if (!note) { alert('请填写付款单号后4位或备注，以便我们核对。'); return; }
    const btn = $('#submitVipOrderBtn');
    btn.disabled = true;
    btn.textContent = '提交中...';
    try {
        const { error } = await supabaseClient.from('vip_orders').insert({
            user_id: USER_ID,
            plan_name: selectedVipPlan.name,
            amount: selectedVipPlan.amount,
            payment_note: note,
            status: 'pending'
        });
        if (error) throw error;
        alert('订单提交成功！\n请耐心等待管理员核实，核实后会员权益将自动到账。');
        $('#vip-modal').classList.remove('show');
        $('#paymentNoteInput').value = '';
    } catch (e) {
        console.error('提交订单失败:', e);
        alert('提交失败：' + e.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '提交';
    }
}

async function openAdminPanel() {
    const listBox = $('#adminOrderList');
    listBox.innerHTML = '<div class="muted" style="text-align:center;">加载中...</div>';
    $('#admin-modal').classList.add('show');
    
    // 清空手动输入框
    if ($('#adminManualUid')) $('#adminManualUid').value = '';
    if ($('#adminSearchResult')) $('#adminSearchResult').style.display = 'none';

    try {
        const { data: orders, error } = await supabaseClient.from('vip_orders')
            .select('*').eq('status', 'pending').order('created_at', { ascending: true });
        if (error) throw error;
        if (!orders || orders.length === 0) {
            listBox.innerHTML = '<div class="muted" style="text-align:center;">暂无待审核订单</div>';
            return;
        }
        listBox.innerHTML = '';
        orders.forEach(o => {
            const div = document.createElement('div');
            div.className = 'admin-order-item';
            div.innerHTML = `
                <div class="admin-order-info">
                    <strong>${o.plan_name} - ¥${o.amount}</strong>
                    <span>UUID: ${o.user_id}</span>
                    <span>备注: <strong>${escapeHtml(o.payment_note)}</strong></span>
                    <span>时间: ${new Date(o.created_at).toLocaleString()}</span>
                </div>
                <button class="btn vip-primary sm" onclick="approveOrder('${o.id}', '${o.user_id}', '${o.plan_name}')">通过</button>
            `;
            listBox.appendChild(div);
        });
    } catch (e) {
        listBox.innerHTML = '<div class="err">加载失败: ' + e.message + '</div>';
    }
}

window.approveOrder = async function(orderId, userId, planName) {
    if(!confirm('确认已收到打款，并为此用户开通吗？')) return;
    try {
        const { error: orderErr } = await supabaseClient.from('vip_orders').update({ status: 'approved' }).eq('id', orderId);
        if (orderErr) throw orderErr;
        let days = 30;
        if (planName === '季卡') days = 90;
        if (planName === '年卡') days = 365;
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + days);
        const { error: userErr } = await supabaseClient.from('agent_settings')
            .update({ is_vip: true, vip_expire_at: expireDate.toISOString() }).eq('id', userId);
        if (userErr) throw userErr;
        alert('开通成功！');
        openAdminPanel();
        if (userId === USER_ID) {
            currentVipStatus.is_vip = true;
            currentVipStatus.expire_at = expireDate.toISOString();
            msgBox.innerHTML = '';
            msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
            const convs = await loadConversations();
            conversationsCache = convs;
            renderConversationList(convs);
        }
    } catch (e) { alert('操作失败: ' + e.message); }
};

// 新增：管理员手动按ID开通
window.adminManualAddVip = async function() {
    const inputId = $('#adminManualUid').value.trim();
    const plan = $('#adminManualPlan').value;
    const resBox = $('#adminSearchResult');
    
    if (!inputId) { alert('请输入要开通的ID'); return; }
    
    resBox.style.display = 'block';
    resBox.textContent = '正在查找用户...';
    resBox.style.color = 'var(--muted)';

    try {
        // 1. 通过 public_user_id 查 UUID
        const { data: profile, error: pError } = await supabaseClient
            .from('profiles')
            .select('id, email')
            .eq('public_user_id', inputId)
            .single();
            
        if (pError || !profile) {
            resBox.textContent = '❌ 未找到该用户ID';
            resBox.style.color = 'var(--danger)';
            return;
        }

        const uuid = profile.id;
        resBox.textContent = `找到用户: ${profile.email || '无邮箱'} (${uuid})。正在开通...`;

        // 2. 计算日期并开通
        let days = 30;
        if (plan === '季卡') days = 90;
        if (plan === '年卡') days = 365;
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + days);

        const { error: updateError } = await supabaseClient.from('agent_settings')
            .upsert({ 
                id: uuid, 
                is_vip: true, 
                vip_expire_at: expireDate.toISOString() 
            }, { onConflict: 'id' });

        if (updateError) throw updateError;

        resBox.textContent = `✅ 成功为用户 ${inputId} 开通了 ${plan}，到期时间: ${expireDate.toLocaleDateString()}`;
        resBox.style.color = 'var(--success)';
        $('#adminManualUid').value = ''; // 清空
        
        // 如果开的是自己的号，刷新前端状态
        if (uuid === USER_ID) {
            currentVipStatus.is_vip = true;
            currentVipStatus.expire_at = expireDate.toISOString();
            msgBox.innerHTML = '';
            msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
        }

    } catch (e) {
        console.error(e);
        resBox.textContent = '❌ 操作失败: ' + e.message;
        resBox.style.color = 'var(--danger)';
    }
};

function renderPendingFiles() {
    const container = $('#attachmentPreviewContainer');
    if (!container) return;
    if (pendingFiles.length === 0) {
        container.classList.remove('show');
        container.innerHTML = '';
        return;
    }
    container.classList.add('show');
    container.innerHTML = '';
    pendingFiles.forEach((file, index) => {
        const card = document.createElement('div');
        card.className = 'file-card';
        let sizeText = '已解析';
        if (file.file && file.file.size) {
            const sizeKB = file.file.size / 1024;
            sizeText = sizeKB > 1024 ? (sizeKB / 1024).toFixed(2) + 'MB' : sizeKB.toFixed(2) + 'KB';
        }
        card.innerHTML = `
            <div class="file-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div class="file-info">
                <span class="file-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
                <span class="file-size">${sizeText}</span>
            </div>
            <div class="remove-file-btn" onclick="removePendingFile(${index})">✕</div>
        `;
        container.appendChild(card);
    });
}

window.removePendingFile = function(index) {
    pendingFiles.splice(index, 1);
    renderPendingFiles();
}

const API_HISTORY_KEY = 'rp_api_history_';
const API_HISTORY_MAX = 10;

function loadApiHistory() {
    if (!USER_ID) return { apiBase: [], apiKey: [] };
    try {
        const raw = localStorage.getItem(API_HISTORY_KEY + USER_ID);
        const obj = raw ? JSON.parse(raw) : {};
        return {
            apiBase: Array.isArray(obj.apiBase) ? obj.apiBase : [],
            apiKey: Array.isArray(obj.apiKey) ? obj.apiKey : []
        };
    } catch(e) { return { apiBase: [], apiKey: [] }; }
}

function saveApiHistory(hist) {
    if (!USER_ID) return;
    try { localStorage.setItem(API_HISTORY_KEY + USER_ID, JSON.stringify(hist)); } catch(e) {}
}

function pushApiHistory(field, value) {
    value = String(value || '').trim();
    if (!value) return;
    const hist = loadApiHistory();
    const list = hist[field];
    const existing = list.find(x => x.v === value);
    if (existing) {
        existing.t = Date.now();
    } else {
        list.unshift({ v: value, t: Date.now() });
    }
    list.sort((a, b) => b.t - a.t);
    hist[field] = list.slice(0, API_HISTORY_MAX);
    saveApiHistory(hist);
}

function removeApiHistory(field, value) {
    const hist = loadApiHistory();
    hist[field] = hist[field].filter(x => x.v !== value);
    saveApiHistory(hist);
}

function maskKey(k) {
    if (!k) return '';
    if (k.length <= 8) return k.slice(0, 2) + '••••';
    return k.slice(0, 4) + '••••••' + k.slice(-4);
}

function renderApiHistory(field) {
    const panelId = field === 'apiBase' ? 'apiBaseHistoryPanel' : 'apiKeyHistoryPanel';
    const inputId  = field === 'apiBase' ? 'apiBase' : 'apiKey';
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const hist = loadApiHistory()[field];
    panel.innerHTML = '';
    if (hist.length === 0) {
        panel.innerHTML = '<div class="api-history-empty">暂无历史记录</div>';
        return;
    }
    hist.forEach(item => {
        const row = document.createElement('div');
        row.className = 'api-history-item';
        const text = field === 'apiKey' ? maskKey(item.v) : item.v;
        row.innerHTML = `
            <span class="api-hist-text" title="${escapeHtml(item.v)}">${escapeHtml(text)}</span>
            <button class="btn sm api-hist-act api-hist-fill" type="button">填入</button>
            <button class="btn sm api-hist-act api-hist-del" type="button">删</button>
        `;
        row.querySelector('.api-hist-fill').addEventListener('click', (ev) => {
            ev.stopPropagation();
            const el = document.getElementById(inputId);
            if (el) el.value = item.v;
            closeAllApiHistoryPanels();
        });
        row.querySelector('.api-hist-del').addEventListener('click', (ev) => {
            ev.stopPropagation();
            removeApiHistory(field, item.v);
            renderApiHistory(field);
        });
        panel.appendChild(row);
    });
}

function closeAllApiHistoryPanels() {
    document.querySelectorAll('.api-history-panel').forEach(p => p.classList.remove('show'));
}

function bindEvents(){
  if (hasBoundEvents) return;
  hasBoundEvents = true;

  if($('#openSidebarBtn')) $('#openSidebarBtn').addEventListener('click', openSidebar);
  if($('#sidebarBackdrop')) $('#sidebarBackdrop').addEventListener('click', closeSidebar);
  if($('#openSettingsFromSidebar')) $('#openSettingsFromSidebar').addEventListener('click', () => {
      closeSidebar();
      openSettingsModal('global');
  });

  let touchStartX = 0, touchStartY = 0, dragging = false;
  document.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      touchStartX = x; touchStartY = y;
      const sb = document.getElementById('sidebar');
      if (x < 30 && !sb.classList.contains('open')) dragging = true;
      else dragging = false;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }
      if (dx > 80) { openSidebar(); dragging = false; }
  }, { passive: true });

  document.addEventListener('touchend', () => { dragging = false; });

  let sbStartX = 0;
  const sidebarEl = document.getElementById('sidebar');
  if (sidebarEl) {
      sidebarEl.addEventListener('touchstart', (e) => {
          if (e.touches.length === 1) sbStartX = e.touches[0].clientX;
      }, { passive: true });
      sidebarEl.addEventListener('touchmove', (e) => {
          const dx = e.touches[0].clientX - sbStartX;
          if (dx < -80) closeSidebar();
      }, { passive: true });
  }

  if($('#multiCancelBtn')) $('#multiCancelBtn').addEventListener('click', () => toggleMultiSelectMode(false));
  if($('#multiDeleteBtn')) $('#multiDeleteBtn').addEventListener('click', deleteSelectedConvs);

  if(document.getElementById('cm-rename')) {
      document.getElementById('cm-rename').addEventListener('click', () => {
          const menu = document.getElementById('context-menu');
          const convId = menu.dataset.convId;
          const oldName = menu.dataset.convName;
          menu.classList.remove('show');
          renameConversation(convId, oldName);
      });
  }
  if(document.getElementById('cm-pin')) {
      document.getElementById('cm-pin').addEventListener('click', () => {
          const menu = document.getElementById('context-menu');
          const convId = menu.dataset.convId;
          const currentStatus = menu.dataset.isPinned === 'true';
          menu.classList.remove('show');
          togglePinConversation(convId, currentStatus);
      });
  }
  if(document.getElementById('cm-select')) {
      document.getElementById('cm-select').addEventListener('click', () => {
          document.getElementById('context-menu').classList.remove('show');
          toggleMultiSelectMode(true);
      });
  }
  if(document.getElementById('cm-delete')) {
      document.getElementById('cm-delete').addEventListener('click', () => {
          const menu = document.getElementById('context-menu');
          const convId = menu.dataset.convId;
          menu.classList.remove('show');
          deleteConversation(convId);
      });
  }

  document.addEventListener('click', (e) => {
      const menu = document.getElementById('context-menu');
      if (menu && menu.classList.contains('show') && !menu.contains(e.target)) {
          menu.classList.remove('show');
      }
  });

  ['apiBase', 'apiKey'].forEach(field => {
      const btnId = field + 'HistoryBtn';
      const panelId = field + 'HistoryPanel';
      const btn = document.getElementById(btnId);
      const panel = document.getElementById(panelId);
      if (!btn || !panel) return;

      btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const wasOpen = panel.classList.contains('show');
          closeAllApiHistoryPanels();
          if (!wasOpen) {
              renderApiHistory(field);
              panel.classList.add('show');
          }
      });
  });

  document.addEventListener('click', (e) => {
      if (!e.target.closest('.api-input-row')) {
          closeAllApiHistoryPanels();
      }
  });

  $('#cancel-edit-input-btn').addEventListener('click', cancelEditMode);

  $('#sendBtn').addEventListener('click', () => { if(busy){ abortCtrl && abortCtrl.abort(); return; } send(); });
  inputEl.addEventListener('input', autoResize);
  inputEl.addEventListener('keydown', e => {
      if(e.key === 'Enter' && !e.shiftKey && !e.isComposing){
          e.preventDefault();
          if(!busy) send();
      }
  });

  $('#submitVipOrderBtn').addEventListener('click', submitVipOrder);

  $('#deepThinkBtn').addEventListener('click', function() { this.classList.toggle('active'); });
  $('#searchBtn').addEventListener('click', function() { this.classList.toggle('active'); });

  const attachBtn = $('#attachBtn');
  const attachMenu = $('#attachMenu');

  if (attachBtn && attachMenu) {
      attachBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          attachMenu.classList.toggle('show');
      });

      document.addEventListener('click', (e) => {
          if (!attachMenu.contains(e.target) && !attachBtn.contains(e.target)) {
              attachMenu.classList.remove('show');
          }
      });

      $('#attachAlbumBtn').addEventListener('click', () => {
          $('#albumInput').click();
          attachMenu.classList.remove('show');
      });

      $('#attachFileBtn').addEventListener('click', () => {
          $('#fileInput').click();
          attachMenu.classList.remove('show');
      });

      $('#albumInput').addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function(event) {
              const base64 = event.target.result;
              pendingFiles.push({ file: file, name: file.name, type: 'image', content: base64 });
              renderPendingFiles();
          };
          reader.readAsDataURL(file);
          this.value = '';
      });

      $('#fileInput').addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (!file) return;

          const ext = file.name.split('.').pop().toLowerCase();

          if (ext === 'docx') {
              const reader = new FileReader();
              reader.onload = function(event) {
                  const arrayBuffer = event.target.result;
                  mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                      .then(function(result) {
                          const text = result.value;
                          pendingFiles.push({ file: file, name: file.name, type: 'text', content: text });
                          renderPendingFiles();
                      })
                      .catch(function(err) {
                          alert('解析 Word 文件失败: ' + err.message);
                      });
              };
              reader.readAsArrayBuffer(file);
          }
          else if (file.type.startsWith('text/') || /\.(txt|md|json|csv)$/i.test(file.name)) {
              const reader = new FileReader();
              reader.onload = function(event) {
                  const text = event.target.result;
                  pendingFiles.push({ file: file, name: file.name, type: 'text', content: text });
                  renderPendingFiles();
              };
              reader.readAsText(file);
          }
          else if (ext === 'pdf') {
              alert('暂不支持直接解析 PDF 文件的文字内容，请复制文字后发送。');
          }
          else {
              alert(`暂不支持解析此类型文件 (${file.name})，请仅上传文本类或 Word 文件。`);
          }
          this.value = '';
      });
  }

  $('#exportBtn').addEventListener('click', () => {
      if(!msgs.length){ alert('还没有对话内容'); return; }
      const text = msgs.map(m => {
          let name = cfg.userName || '我';
          if (m.role === 'assistant') {
              const a = currentAgents.find(x => x.id === m.agent_id);
              name = a ? a.name : '角色';
          }
          return name + '：\n' + (m.reasoning ? `[思考过程]\n${m.reasoning}\n[正文]\n` : '') + m.content;
      }).join('\n\n---\n\n');
      const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = '群聊记录-' + new Date().toISOString().slice(0,10) + '.txt'; a.click();
  });

  $('#clearChatBtn').addEventListener('click', async () => {
      if (!currentConversationId) { alert('请先打开一个会话'); return; }
      const conv = conversationsCache.find(c => c.id === currentConversationId);
      const name = conv?.agent_name || '当前会话';
      if(!confirm(`确定要清空「${name}」的聊天记录吗？此操作不可恢复。`)) return;
      msgs = []; msgBox.innerHTML = ''; activeLeafId = null;
      cancelEditMode();
      await persistActiveLeafId(null);
      if (USER_ID && currentConversationId) await supabaseClient.from('chat_messages').delete().eq('conversation_id', currentConversationId);
  });

  $('#fetchModelsBtn').addEventListener('click', async () => {
    const btn = $('#fetchModelsBtn'); const modelListContainer = $('#modelListContainer');
    const apiBase = $('#apiBase').value.trim(); const apiKey = $('#apiKey').value.trim();
    if (!apiBase) { alert('请先填写 API 地址！'); return; }
    let baseUrl = apiBase.replace(/\/+$/, '');
    if (baseUrl.endsWith('/chat/completions')) baseUrl = baseUrl.replace('/chat/completions', '');
    if (!baseUrl.endsWith('/v1')) baseUrl += '/v1';
    btn.textContent = '获取中...'; btn.disabled = true; modelListContainer.style.display = 'none'; modelListContainer.innerHTML = '';
    try {
      const res = await fetch(baseUrl + '/models', { method: 'GET', headers: { 'Authorization': 'Bearer ' + apiKey } });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json(); const models = Array.isArray(data) ? data : (data.data || []);
      if (models.length === 0) { modelListContainer.innerHTML = '<div style="padding:8px; font-size:calc(12px * var(--font-scale)); color:var(--danger);">未找到任何模型。</div>'; modelListContainer.style.display = 'block'; return; }
      models.forEach(m => {
        const modelId = m.id || m.model || m.name || String(m);
        const item = document.createElement('div'); item.textContent = modelId;
        item.style.cssText = 'padding:6px 10px; font-size:calc(13px * var(--font-scale)); cursor:pointer; border-radius:4px; color:var(--text);';
        item.onmouseover = () => item.style.background = 'var(--border)';
        item.onmouseout = () => item.style.background = 'transparent';
        item.onclick = () => { $('#model').value = modelId; cfg.model = modelId; saveCfg(); modelListContainer.style.display = 'none'; };
        modelListContainer.appendChild(item);
      });
      modelListContainer.style.display = 'block';
    } catch (e) {
      modelListContainer.innerHTML = '<div style="padding:8px; font-size:calc(12px * var(--font-scale)); color:var(--danger);">获取失败：' + e.message + '</div>';
      modelListContainer.style.display = 'block';
    } finally { btn.textContent = '获取'; btn.disabled = false; }
  });

  $('#applyBtn').addEventListener('click', async () => {
    cfg.apiBase = $('#apiBase').value.trim();
    cfg.apiKey = $('#apiKey').value.trim();
    cfg.model = $('#model').value.trim();
    cfg.temperature = Number($('#temperature').value);
    cfg.maxTokens = Number($('#maxTokens').value);
    cfg.ctxLimit = Number($('#ctxLimit').value);
    cfg.userName = $('#userName').value.trim();
    cfg.userPrompt = $('#userPrompt').value.trim();
    saveCfg();
    pushApiHistory('apiBase', cfg.apiBase);
    pushApiHistory('apiKey', cfg.apiKey);
    await saveGlobalSettings();
    alert('全局设置已保存！');
  });

  $('#openCharSettingsBtn').addEventListener('click', () => openSettingsModal('role'));

  $('#addAgentBtn').addEventListener('click', () => {
      if (!currentConversation) { alert('请先选择一个会话'); return; }
      if (currentConversation.is_system_fixed || currentConversation.is_hidden_prompt) { alert('系统固定对话不可添加角色'); return; }
      saveFormToCurrentAgent();
      const newAgent = { id: generateId(), name: '新角色', prompt: '请在这里输入角色设定...', greeting: '', avatar: '' };
      currentAgents.push(newAgent);
      editingAgentId = newAgent.id;
      renderCharSettings();
  });

  $('#avatarPreview').addEventListener('click', () => { $('#avatarFileInput').click(); });
  $('#avatarUploadText').addEventListener('click', () => { $('#avatarFileInput').click(); });
  $('#avatarFileInput').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
          const img = new Image();
          img.onload = function() {
              const canvas = document.createElement('canvas');
              const size = 200;
              canvas.width = size; canvas.height = size;
              const ctx = canvas.getContext('2d');
              const minSize = Math.min(img.width, img.height);
              const sx = (img.width - minSize) / 2;
              const sy = (img.height - minSize) / 2;
              ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, size, size);
              const base64 = canvas.toDataURL('image/jpeg', 0.8);
              const agent = currentAgents.find(a => a.id === editingAgentId);
              if (agent) agent.avatar = base64;
              updateAvatarPreview(base64);
              e.target.value = '';
          };
          img.src = event.target.result;
      };
      reader.readAsDataURL(file);
  });

  $('#userAvatarPreview').addEventListener('click', () => { $('#userAvatarFileInput').click(); });
  $('#userAvatarUploadText').addEventListener('click', () => { $('#userAvatarFileInput').click(); });
  $('#userAvatarFileInput').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(event) {
          const img = new Image();
          img.onload = function() {
              const canvas = document.createElement('canvas');
              const size = 200;
              canvas.width = size; canvas.height = size;
              const ctx = canvas.getContext('2d');
              const minSize = Math.min(img.width, img.height);
              const sx = (img.width - minSize) / 2;
              const sy = (img.height - minSize) / 2;
              ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, size, size);
              const base64 = canvas.toDataURL('image/jpeg', 0.8);
              if (currentConversation) currentConversation.tempUserAvatar = base64;
              updateUserAvatarPreview(base64);
              e.target.value = '';
          };
          img.src = event.target.result;
      };
      reader.readAsDataURL(file);
  });

  $('#saveCharSettingsBtn').addEventListener('click', async () => {
      if (currentConversationId && currentConversation) {
          saveFormToCurrentAgent();
          const userAvatar = currentConversation.tempUserAvatar !== undefined ? currentConversation.tempUserAvatar : currentConversation.user_avatar;
          currentConversation.user_avatar = userAvatar;
          await saveConversationSettings(currentConversationId, currentAgents, userAvatar);
          currentConversation.agents = currentAgents;
          if (!currentAgents.find(a => a.id === currentAgentId)) currentAgentId = currentAgents[0].id;
          updateCurrentConversationUI(currentConversation);
          renderAgentSelector();
          msgBox.innerHTML = '';
          msgs.forEach((m, i) => addBubble(m.role, m.content, i, m.tokens, m.reasoning, m.agent_id));
      }
      cfg.apiBase = $('#apiBase').value.trim();
      cfg.apiKey = $('#apiKey').value.trim();
      cfg.model = $('#model').value.trim();
      cfg.temperature = Number($('#temperature').value);
      cfg.maxTokens = Number($('#maxTokens').value);
      cfg.ctxLimit = Number($('#ctxLimit').value);
      cfg.userName = $('#userName').value.trim();
      cfg.userPrompt = $('#userPrompt').value.trim();
      saveCfg();
      pushApiHistory('apiBase', cfg.apiBase);
      pushApiHistory('apiKey', cfg.apiKey);

      if (settingsDraft) {
          const f = Number(settingsDraft.fontSize) || 15;
          const l = Number(settingsDraft.lineHeight) || 1.72;
          styleConfig.fontSize = f;
          styleConfig.lineHeight = l;
          styleConfig.userFontSize = f;
          styleConfig.assistantFontSize = f;
          styleConfig.userLineHeight = l;
          styleConfig.assistantLineHeight = l;
          styleConfig.userBubbleWidth = 78;
          applyStyleConfig();
          applyTheme(settingsDraft.theme, { persist: true, ts: Date.now() });
          settingsDraft = null;
      }

      await saveGlobalSettings();
      closeAllApiHistoryPanels();
      $('#char-settings-modal').classList.remove('show');
      alert('设置已保存');
  });

  $('#logoutBtn').addEventListener('click', async () => {
    if(!confirm('确定要退出登录吗？')) return;
    await supabaseClient.auth.signOut();
    window.location.reload();
  });

  $('#newConvBtn').addEventListener('click', async () => {
    if (busy) { alert('请等待当前回复完成。'); return; }
    const newConv = await createConversation();
    if (newConv) {
      conversationsCache.unshift(newConv);
      renderConversationList(conversationsCache);
      await switchConversation(newConv.id, newConv);
      closeSidebar();
    }
  });

  msgBox.addEventListener('click', async (e) => {
    const moreBtn = e.target.closest('.more-btn');
    if (moreBtn) {
        e.stopPropagation();
        const menu = moreBtn.nextElementSibling;
        if (menu) {
            const isHidden = menu.style.display === 'none' || menu.style.display === '';
            document.querySelectorAll('.more-menu').forEach(m => m.style.display = 'none');
            menu.style.display = isHidden ? 'block' : 'none';
        }
        return;
    }

    if (!e.target.closest('.more-actions-wrap')) {
        document.querySelectorAll('.more-menu').forEach(m => m.style.display = 'none');
    }

    const btn = e.target.closest('button');
    if (!btn) return;

    const index = parseInt(btn.getAttribute('data-msg-index'));
    if (isNaN(index)) return;

    if (btn.classList.contains('regen-btn')) {
        await regenerateMessage(index);
    } else if (btn.classList.contains('continue-btn')) {
        await continueGeneration(index);
    } else if (btn.classList.contains('version-btn')) {
        switchVersion(index, parseInt(btn.getAttribute('data-direction')));
    } else if (btn.classList.contains('edit-btn')) {
        openEditModal(index);
    } else if (btn.classList.contains('delete-btn')) {
        document.querySelectorAll('.more-menu').forEach(m => m.style.display = 'none');
        await deleteMessage(index);
    }
  });

  document.addEventListener('click', (e) => {
      if (!e.target.closest('.more-actions-wrap')) {
          document.querySelectorAll('.more-menu').forEach(m => m.style.display = 'none');
      }
  });

  const openAccBtn = $('#openAccountBtn');
  if (openAccBtn) {
      openAccBtn.addEventListener('click', () => {
          saveCurrentAccountToCache();
          renderAccountMini();
          renderAccountModal();
          $('#account-modal').classList.add('show');
      });
  }
  const closeAccBtn = $('#closeAccountModal');
  if (closeAccBtn) closeAccBtn.addEventListener('click', () => $('#account-modal').classList.remove('show'));

  const addAccBtn = $('#addAccountBtn');
  if (addAccBtn) addAccBtn.addEventListener('click', addAccount);

  initFloatingBall();
}

function initFloatingBall() {
  const fabContainer = document.getElementById('floating-ball-container');
  const fabBall = document.getElementById('floating-ball');
  const fabMenu = document.getElementById('floating-menu');

  if (!fabContainer || !fabBall || !fabMenu) return;

  const savedPos = localStorage.getItem('rp_fab_pos');
  if (savedPos) {
    try {
      const pos = JSON.parse(savedPos);
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      fabContainer.style.left = Math.max(10, Math.min(pos.x, maxX)) + 'px';
      fabContainer.style.top = Math.max(10, Math.min(pos.y, maxY)) + 'px';
    } catch(e) {}
  } else {
    fabContainer.style.right = '20px';
    fabContainer.style.bottom = '120px';
  }

  let isDragging = false;
  let hasMoved = false;
  let startX, startY, initialLeft, initialTop;

  fabBall.addEventListener('pointerdown', (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;

    const rect = fabContainer.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    fabContainer.style.right = 'auto';
    fabContainer.style.bottom = 'auto';
    fabContainer.style.left = initialLeft + 'px';
    fabContainer.style.top = initialTop + 'px';

    fabBall.classList.add('dragging');
    fabBall.setPointerCapture(e.pointerId);
  });

  fabBall.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasMoved = true;
      fabMenu.classList.remove('show');
    }

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    const maxX = window.innerWidth - fabContainer.offsetWidth;
    const maxY = window.innerHeight - fabContainer.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, maxX));
    newTop = Math.max(0, Math.min(newTop, maxY));

    fabContainer.style.left = newLeft + 'px';
    fabContainer.style.top = newTop + 'px';
  });

  fabBall.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    fabBall.classList.remove('dragging');
    fabBall.releasePointerCapture(e.pointerId);

    const rect = fabContainer.getBoundingClientRect();
    localStorage.setItem('rp_fab_pos', JSON.stringify({ x: rect.left, y: rect.top }));

    if (!hasMoved) {
      const isShowing = fabMenu.classList.contains('show');
      if (isShowing) {
        fabMenu.classList.remove('show');
      } else {
        if (rect.top < window.innerHeight / 2) {
          fabMenu.style.bottom = 'auto';
          fabMenu.style.top = '65px';
        } else {
          fabMenu.style.top = 'auto';
          fabMenu.style.bottom = '65px';
        }
        if (rect.left < window.innerWidth / 2) {
            fabMenu.style.right = 'auto';
            fabMenu.style.left = '0';
        } else {
            fabMenu.style.left = 'auto';
            fabMenu.style.right = '0';
        }
        fabMenu.classList.add('show');
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!fabContainer.contains(e.target)) {
      fabMenu.classList.remove('show');
    }
  });

  window.addEventListener('resize', () => {
    const rect = fabContainer.getBoundingClientRect();
    const maxX = window.innerWidth - fabContainer.offsetWidth;
    const maxY = window.innerHeight - fabContainer.offsetHeight;
    if (rect.left > maxX) fabContainer.style.left = maxX + 'px';
    if (rect.top > maxY) fabContainer.style.top = maxY + 'px';
  });

  document.getElementById('fab-account').addEventListener('click', () => {
    fabMenu.classList.remove('show');
    if (typeof saveCurrentAccountToCache === 'function') saveCurrentAccountToCache();
    if (typeof renderAccountMini === 'function') renderAccountMini();
    if (typeof renderAccountModal === 'function') renderAccountModal();
    const accModal = document.getElementById('account-modal');
    if (accModal) accModal.classList.add('show');
  });
}

const ACCOUNTS_KEY = 'rp_accounts';

function getSupabaseStorageKey() {
  const m = String(SUPABASE_URL).match(/^https:\/\/([^.]+)\.supabase\.co/);
  return m ? `sb-${m[1]}-auth-token` : null;
}

function getAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); } catch(e) { return []; }
}
function saveAccounts(list) {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); } catch(e) {}
}

function upsertAccountFromSession(session) {
  if (!session || !session.user) return;
  const list = getAccounts();
  const uid = session.user.id;
  const existing = list.find(a => a.uid === uid);
  const snapshot = {
    access_token: session.access_token,
    token_type: session.token_type,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    refresh_token: session.refresh_token,
    user: session.user
  };
  const entry = {
    uid,
    email: session.user.email || (existing ? existing.email : ''),
    session: snapshot,
    updated_at: Date.now()
  };
  if (existing) Object.assign(existing, entry);
  else list.push(entry);
  saveAccounts(list);
}

function saveCurrentAccountToCache() {
  try {
    const key = getSupabaseStorageKey();
    if (!key) return;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.user) upsertAccountFromSession(parsed);
  } catch(e) { console.warn('保存当前账号失败:', e); }
}

function renderAccountMini() {
  const emailEl = $('#accountMiniEmail');
  const avatarEl = $('#accountMiniAvatar');
  const pidEl = $('#accountMiniPublicId');
  if (!emailEl || !avatarEl) return;
  
  emailEl.textContent = currentUserEmail || USER_ID || '未登录';
  
  if (pidEl) {
      pidEl.innerHTML = `ID: <strong>${currentPublicUserId || '未分配'}</strong> 
        <span style="margin-left:6px; font-size:10px; color:var(--accent); cursor:pointer;" onclick="navigator.clipboard.writeText('${currentPublicUserId}');alert('已复制ID: ${currentPublicUserId}')">复制</span>`;
  }

  if (globalDefaultUserAvatar) {
    avatarEl.innerHTML = `<img src="${globalDefaultUserAvatar}" alt="avatar" style="width:100%;height:100%;object-fit:cover;">`;
  } else {
    avatarEl.innerHTML = '<span style="font-size:20px;">👤</span>';
  }
}

function renderAccountModal() {
  const currentBox = $('#currentAccountBox');
  const listBox = $('#accountListBox');
  if (!currentBox || !listBox) return;

  const avatarHtml = globalDefaultUserAvatar
    ? `<img src="${globalDefaultUserAvatar}" alt="avatar" style="width:100%;height:100%;object-fit:cover;">`
    : '<span style="font-size:18px;">👤</span>';

  currentBox.innerHTML = `
    <div class="acc-avatar">${avatarHtml}</div>
    <div style="flex:1; text-align:left; margin-left:10px; min-width:0;">
      <div style="font-size:calc(13px * var(--font-scale)); font-weight:600; word-break:break-all;">${escapeHtml(currentUserEmail || USER_ID || '未登录')}</div>
      <div style="font-size:calc(12px * var(--font-scale)); color:var(--accent); margin:2px 0;">ID: <strong>${currentPublicUserId || '未分配'}</strong></div>
      <div style="font-size:calc(11px * var(--font-scale)); color:var(--muted);">当前正在使用</div>
    </div>
    <button class="btn sm" onclick="navigator.clipboard.writeText('${currentPublicUserId}');alert('已复制ID: ${currentPublicUserId}')" style="padding:4px 8px; font-size:11px;">复制ID</button>
  `;

  listBox.innerHTML = '';
  const others = getAccounts().filter(a => a.uid !== USER_ID);
  if (others.length === 0) {
    listBox.innerHTML = '<div class="muted" style="font-size:calc(12px * var(--font-scale)); padding:8px 0;">暂无其他已保存账号，点击下方「添加账号」登录。</div>';
    return;
  }
  others.forEach(acc => {
    const item = document.createElement('div');
    item.className = 'account-item';
    item.innerHTML = `
      <div class="acc-avatar"><span style="font-size:18px;">👤</span></div>
      <div style="flex:1; text-align:left; margin-left:10px; min-width:0;">
        <div style="font-size:calc(13px * var(--font-scale)); font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(acc.email || acc.uid)}</div>
      </div>
      <button class="btn sm switch-acc-btn">切换</button>
      <button class="btn sm remove-acc-btn" style="color:var(--danger); border-color:var(--danger);">移除</button>
    `;
    item.querySelector('.switch-acc-btn').addEventListener('click', () => switchAccount(acc.uid));
    item.querySelector('.remove-acc-btn').addEventListener('click', () => removeAccount(acc.uid));
    listBox.appendChild(item);
  });
}

function renderSavedAccountsInAuth() {
  const box = $('#authSavedAccounts');
  const listBox = $('#authSavedList');
  if (!box || !listBox) return;
  const list = getAccounts();
  if (list.length === 0) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  listBox.innerHTML = '';
  list.forEach(acc => {
    const item = document.createElement('div');
    item.className = 'account-item';
    item.style.cursor = 'pointer';
    item.innerHTML = `
      <div class="acc-avatar"><span style="font-size:18px;">👤</span></div>
      <div style="flex:1; text-align:left; margin-left:10px; min-width:0;">
        <div style="font-size:calc(13px * var(--font-scale)); font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(acc.email || acc.uid)}</div>
      </div>
      <span style="font-size:calc(12px * var(--font-scale)); color:var(--accent); font-weight:600;">切换</span>
    `;
    item.addEventListener('click', () => switchAccount(acc.uid));
    listBox.appendChild(item);
  });
}

function switchAccount(uid) {
  if (uid === USER_ID) { alert('已经是当前账号了'); return; }
  saveCurrentAccountToCache();
  const target = getAccounts().find(a => a.uid === uid);
  if (!target || !target.session) { alert('账号信息缺失，请重新登录该账号'); return; }
  const key = getSupabaseStorageKey();
  if (!key) { alert('无法定位登录存储，请刷新页面重试'); return; }
  try {
    localStorage.setItem(key, JSON.stringify(target.session));
    window.location.reload();
  } catch(e) {
    alert('切换账号失败：' + (e.message || e));
  }
}

function removeAccount(uid) {
  if (uid === USER_ID) { alert('不能移除当前正在使用的账号'); return; }
  if (!confirm('确定要从此设备移除该账号吗？（不会注销账号，只是清除本机保存）')) return;
  saveAccounts(getAccounts().filter(a => a.uid !== uid));
  renderAccountModal();
}

async function addAccount() {
  if (!confirm('添加新账号需要先退出当前账号。\n当前账号已保存在本机，可随时在登录界面或账号管理里切换回来。\n\n是否继续？')) return;
  saveCurrentAccountToCache();
  try { await supabaseClient.auth.signOut({ scope: 'local' }); } catch(e) { console.warn(e); }

  document.querySelectorAll('#account-modal,#char-settings-modal,#vip-modal,#admin-modal').forEach(m => m.classList.remove('show'));
  USER_ID = null;
  currentLoadedUserId = null;
  authOverlay.classList.remove('hidden');
  authMsg.textContent = '';
  authMsg.className = 'auth-msg';
  $('#auth-title').textContent = '登录 / 添加账号';
  $('#auth-subtitle').textContent = '登录后将作为当前账号，原账号已保存在本机';
  authLoginBtn.textContent = '登录';
  authRegisterBtn.textContent = '没有账号？点击注册';
  isRegisterMode = false;
  renderSavedAccountsInAuth();
}

const authOverlay = $('#auth-overlay');
const authEmail = $('#auth-email');
const authPassword = $('#auth-password');
const authLoginBtn = $('#auth-login-btn');
const authRegisterBtn = $('#auth-register-btn');
const authMsg = $('#auth-msg');

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  $('#auth-title').textContent = isRegisterMode ? '创建账号' : '欢迎回来';
  $('#auth-subtitle').textContent = isRegisterMode ? '注册一个新账号开始使用' : '登录以同步您的角色与聊天记录';
  authLoginBtn.textContent = isRegisterMode ? '注册' : '登录';
  authRegisterBtn.textContent = isRegisterMode ? '已有账号？点击登录' : '没有账号？点击注册';
  authMsg.textContent = '';
}
authRegisterBtn.addEventListener('click', toggleAuthMode);

async function handleAuthAction() {
  const email = authEmail.value.trim(); const password = authPassword.value;
  if (!email || !password) { authMsg.textContent = '请填写邮箱和密码'; authMsg.className = 'auth-msg error'; return; }
  if (password.length < 6) { authMsg.textContent = '密码至少需要6位'; authMsg.className = 'auth-msg error'; return; }
  authLoginBtn.disabled = true; authMsg.textContent = '处理中...'; authMsg.className = 'auth-msg';
  try {
    let result = isRegisterMode ? await supabaseClient.auth.signUp({ email, password }) : await supabaseClient.auth.signInWithPassword({ email, password });
    if (result.error) {
      authMsg.textContent = result.error.message; authMsg.className = 'auth-msg error';
    } else {
      if (isRegisterMode) {
        authMsg.textContent = '注册成功！请直接登录。'; authMsg.className = 'auth-msg success';
        if (result.data.session) window.location.reload(); else toggleAuthMode();
      } else window.location.reload();
    }
  } catch (e) { authMsg.textContent = '网络错误'; authMsg.className = 'auth-msg error'; }
  finally { authLoginBtn.disabled = false; }
}
authLoginBtn.addEventListener('click', handleAuthAction);

async function init() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session && session.user) {
    USER_ID = session.user.id;
    currentUserEmail = session.user.email || '';
    upsertAccountFromSession(session);
    authOverlay.classList.add('hidden');
    await new Promise(r => setTimeout(r, 80));

    // ★ 版本门禁：未通过则锁死，不发请求、不渲染
    const passed = await enforceVersionGate(USER_ID);
    if (!passed) return;

    await loadUserData();
  } else {
    authOverlay.classList.remove('hidden');
    renderSavedAccountsInAuth();
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session && session.user) {
      currentUserEmail = session.user.email || '';
      upsertAccountFromSession(session);
    }
    if (event === 'SIGNED_OUT') {
      USER_ID = null;
      currentLoadedUserId = null;
      authOverlay.classList.remove('hidden');
      renderSavedAccountsInAuth();
    } else if (session && session.user && USER_ID !== session.user.id) {
      USER_ID = session.user.id;
      authOverlay.classList.add('hidden');
      // ★ 切号/重登也必须过门禁，否则可绕过
      enforceVersionGate(USER_ID).then(ok => { if (ok) loadUserData(); });
    }
  });
}

// ============================================================
// ★ 新增：内测号（对外ID为 nc 开头）专属布局
//   1. 收起悬浮球（“账号”入口已整合进设置面板）
//   2. 把“账号”卡片从「全局设置」移到「当前角色」，置于接口配置上方
//   普通号（纯数字ID）直接 return，完全保持原样
// ============================================================
function applyBetaAccountLayout() {
    const isBetaAccount = /^nc\d+$/i.test(currentPublicUserId || '');
    if (!isBetaAccount) return;

    // 1. 收起悬浮球
    const fabContainer = document.getElementById('floating-ball-container');
    if (fabContainer) fabContainer.style.display = 'none';

    // 2. 账号卡片前移到「当前角色」页（接口配置上方）
    const accountBtn = document.getElementById('openAccountBtn');
    const roleTab = document.getElementById('settingsTabRole');
    if (accountBtn && roleTab) {
        const apiGroup = roleTab.querySelector('.settings-group');
        if (apiGroup) {
            accountBtn.style.marginBottom = '14px';
            roleTab.insertBefore(accountBtn, apiGroup);
        }
    }

    // 3. 同步更新提示文案
    const tip = document.getElementById('roleTabTip');
    if (tip) {
        tip.innerHTML = '提示：账号、角色名、头像、开场白等请在本页或「全局设置」中修改。';
    }
}

async function loadUserData() {
  if (!USER_ID || currentLoadedUserId === USER_ID) return;
  currentLoadedUserId = USER_ID;
  cfg = loadCfg();
  updateGlobalUI();
  bindEvents();
  
  // 拉取对外展示的用户ID（带自愈逻辑）
  try {
      let { data: profile } = await supabaseClient.from('profiles').select('public_user_id').eq('id', USER_ID).maybeSingle();

      if (!profile) {
          // 如果查不到，说明是新注册的，前端自动补一个
          const { data: seqData } = await supabaseClient.from('public_id_seq').select('last_value').single();
          const nextSeq = (seqData?.last_value || 1) + 1;
          const newPid = '1' + String(nextSeq).padStart(4, '0');
          
          await supabaseClient.from('profiles').insert({ 
              id: USER_ID, 
              public_user_id: newPid, 
              public_id_seq: nextSeq, 
              account_type: 'user' 
          });
          currentPublicUserId = newPid;
      } else {
          currentPublicUserId = profile.public_user_id;
      }
  } catch(e) {
      console.warn('获取用户公开ID失败', e);
      currentPublicUserId = '未分配';
  }

  // ★ 新增：内测号专属布局（nc 开头），普通号不触发任何变化
  applyBetaAccountLayout();

  await fetchGlobalSettings();
  await checkFeatureFlags();

  if ($('#betaBadge')) {
      if (isBetaUser) {
          $('#betaBadge').style.display = 'inline-block';
      } else {
          $('#betaBadge').style.display = 'none';
      }
  }
  updateGlobalSettingsTabLock();

  renderAccountMini();
  let convs = await loadConversations();
  if (convs.length === 0) {
    const newConv = await createConversation();
    if (newConv) convs = [newConv];
  }
  conversationsCache = convs;
  renderConversationList(convs);

  await autoOpenLastConversation();

  setupRealtimeListener();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw-chat.js?v=' + CURRENT_VERSION).then(reg => {
      setInterval(() => { reg.update(); }, 300000);
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ action: 'skipWaiting' });
          }
        });
      });
    }).catch(err => console.log('SW 注册失败:', err));

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });
  });
}

setupThemeUI();
init();
</script>
</body>
</html>
