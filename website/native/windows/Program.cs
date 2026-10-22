using System.Diagnostics;
using System.IO.Compression;
using System.Reflection;
using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace RWTools;
static class Program {
  [STAThread] static void Main() { ApplicationConfiguration.Initialize(); Application.Run(new Workshop()); }
}
sealed class Workshop : Form {
  readonly WebView2 browser=new(); bool online=false;
  const string AppHost="app.rwtools.invalid";
  public Workshop() {
    Text="铁锈战争模组工具 · RW Mod Tools"; Width=1360; Height=900; MinimumSize=new(380,600);
    StartPosition=FormStartPosition.CenterScreen; browser.Dock=DockStyle.Fill; Controls.Add(browser);
    Shown+=async(_,_)=>await Start();
  }
  async Task Start() {
    try {
      var root=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),"Noaushio","RWModTools");
      var site=Path.Combine(root,"site-1.1.0");Directory.CreateDirectory(root);
      if(!File.Exists(Path.Combine(site,"index.html"))) {
        Directory.CreateDirectory(site);using var zip=Assembly.GetExecutingAssembly().GetManifestResourceStream("RWTools.Site.zip")!;
        using var archive=new ZipArchive(zip);archive.ExtractToDirectory(site,true);
      }
      var env=await CoreWebView2Environment.CreateAsync(null,Path.Combine(root,"BrowserData"));
      await browser.EnsureCoreWebView2Async(env);
      browser.CoreWebView2.SetVirtualHostNameToFolderMapping(AppHost,site,CoreWebView2HostResourceAccessKind.DenyCors);
      browser.CoreWebView2.Settings.AreHostObjectsAllowed=false;
      browser.CoreWebView2.Settings.UserAgent+=" RWModTools/1.1.0";
      browser.CoreWebView2.AddWebResourceRequestedFilter("*",CoreWebView2WebResourceContext.All);
      browser.CoreWebView2.WebResourceRequested+=(_,e)=>{
        if(Uri.TryCreate(e.Request.Uri,UriKind.Absolute,out var uri)&&uri.Scheme.StartsWith("http")&&uri.Host!=AppHost&&!online)
          e.Response=env.CreateWebResourceResponse(new MemoryStream(),503,"Offline mode","Content-Type: text/plain");
      };
      browser.CoreWebView2.WebMessageReceived+=(_,e)=>{
        if(!e.Source.StartsWith("https://"+AppHost+"/"))return;
        try { using var d=JsonDocument.Parse(e.WebMessageAsJson);if(d.RootElement.GetProperty("type").GetString()=="network-mode")online=d.RootElement.GetProperty("online").GetBoolean(); } catch {}
      };
      browser.CoreWebView2.NavigationStarting+=(_,e)=>{if(Uri.TryCreate(e.Uri,UriKind.Absolute,out var u)&&u.Host!=AppHost){e.Cancel=true;OpenExternal(u);}};
      browser.CoreWebView2.NewWindowRequested+=(_,e)=>{e.Handled=true;if(Uri.TryCreate(e.Uri,UriKind.Absolute,out var u))OpenExternal(u);};
      browser.CoreWebView2.PermissionRequested+=(_,e)=>e.State=CoreWebView2PermissionState.Deny;
      browser.CoreWebView2.Navigate("https://"+AppHost+"/index.html?lang=zh#editors");
    }catch(WebView2RuntimeNotFoundException){MessageBox.Show("需要 Microsoft Edge WebView2 Runtime 才能运行\n安装一次后即可离线创作\nhttps://developer.microsoft.com/microsoft-edge/webview2/",Text);Close();}
    catch(Exception e){MessageBox.Show("无法打开创作工具\n"+e.Message,Text);Close();}
  }
  static void OpenExternal(Uri uri){if(uri.Scheme=="https"||uri.Scheme=="http")Process.Start(new ProcessStartInfo(uri.AbsoluteUri){UseShellExecute=true});}
}
