"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { SettingsAdmin } from "@/api/services/settings.service";

const SOCIAL_PLATFORMS = [
  "Facebook", "Instagram", "YouTube", "Twitter / X", "LinkedIn",
  "TikTok", "WhatsApp", "Telegram", "Snapchat", "Pinterest",
  "Threads", "Discord", "GitHub", "Behance", "Dribbble",
  "Vimeo", "SoundCloud", "Spotify", "Medium", "Reddit",
];

function genId() { return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`; }

export function CoreForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({ name: "", description: "" });
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string; id: string }[]>([]);
  const [contactInfo, setContactInfo] = useState({ phone: "", email: "", address: "", mapEmbed: "", whatsappNumber: "" });
  const [seo, setSeo] = useState({ title: "", description: "", keywords: "" });
  const [scripts, setScripts] = useState({ head: "", body: "" });
  const [newLink, setNewLink] = useState({ platform: "", url: "" });

  useEffect(() => {
    SettingsAdmin.get()
      .then((data) => {
        setCompanyInfo({
          name: data.company_info?.name ?? "",
          description: data.company_info?.description ?? "",
        });
        setSocialLinks((data.social_links ?? []).map((l) => ({ platform: l.platform, url: l.url, id: l.id || genId() })));
        setContactInfo({
          phone: data.contact_info?.phone ?? "",
          email: data.contact_info?.email ?? "",
          address: data.contact_info?.address ?? "",
          mapEmbed: data.contact_info?.mapEmbed ?? "",
          whatsappNumber: data.contact_info?.whatsappNumber ?? "",
        });
        setSeo({
          title: data.seo?.title ?? "",
          description: data.seo?.description ?? "",
          keywords: data.seo?.keywords ?? "",
        });
        setScripts({
          head: data.scripts?.head ?? "",
          body: data.scripts?.body ?? "",
        });
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const addSocialLink = () => {
    if (!newLink.platform || !newLink.url) return;
    setSocialLinks((prev) => [...prev, { ...newLink, id: genId() }]);
    setNewLink({ platform: "", url: "" });
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const save = async () => {
    setSaving(true);
    try {
      await SettingsAdmin.put({
        company_info: companyInfo,
        social_links: socialLinks,
        contact_info: contactInfo,
        seo,
        scripts,
      });
      toast.success("Settings saved");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      toast.error(msg ? Object.values(msg).flat().join(", ") : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-none">Settings</h1>
          <p className="text-xs text-gray-500 mt-1">Site-wide configuration</p>
        </div>
        <Button onClick={save} disabled={saving} className="bg-[lab(20_23.9_-60.14)] hover:bg-[lab(15_23.9_-60.14)] text-white">
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? "Saving\u2026" : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="company" className="w-full flex flex-col">
        <div>
          <TabsList className="bg-gray-100 rounded-lg p-0.5 gap-0 w-auto h-auto">
            <TabsTrigger value="company" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Company</TabsTrigger>
            <TabsTrigger value="social" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Social Links</TabsTrigger>
            <TabsTrigger value="contact" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Contact Info</TabsTrigger>
            <TabsTrigger value="seo" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">SEO</TabsTrigger>
            <TabsTrigger value="scripts" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[lab(20_23.9_-60.14)] data-[state=active]:shadow-sm text-gray-500 px-3 py-1.5 text-xs font-medium">Scripts</TabsTrigger>
          </TabsList>
        </div>

        <div>
          <TabsContent value="company" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Company Info</p>
                <p className="text-xs text-gray-500 -mt-2">Displayed across the site in headers, footers, and meta.</p>

                <div className="space-y-1.5">
                  <Label>Company Name</Label>
                  <Input value={companyInfo.name} onChange={(e) => setCompanyInfo((p) => ({ ...p, name: e.target.value }))} placeholder="Horizon Nepal" />
                </div>

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <RichEditor
                    value={companyInfo.description}
                    onChange={(html) => setCompanyInfo((p) => ({ ...p, description: html }))}
                    minHeight={250}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Social Media Links</p>
                <p className="text-xs text-gray-500 -mt-2">Links appear in the website footer and contact sections.</p>

                {socialLinks.length > 0 && (
                  <div className="space-y-2">
                    {socialLinks.map((link) => (
                      <div key={link.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="min-w-28">
                          <p className="text-xs font-medium text-gray-700">{link.platform}</p>
                        </div>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[lab(20_23.9_-60.14)] hover:underline truncate flex-1">{link.url}</a>
                        <Button type="button" variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50 shrink-0" onClick={() => removeSocialLink(link.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Add New Link</p>
                  <div className="flex items-end gap-2 flex-wrap">
                    <div className="space-y-1 min-w-32">
                      <Label className="text-[11px] text-gray-500">Platform</Label>
                      <Select value={newLink.platform} onValueChange={(v) => setNewLink((p) => ({ ...p, platform: v }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {SOCIAL_PLATFORMS.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1 flex-1 min-w-48">
                      <Label className="text-[11px] text-gray-500">URL</Label>
                      <Input value={newLink.url} onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))} placeholder="https://facebook.com/..." className="h-7 text-xs" />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addSocialLink} disabled={!newLink.platform || !newLink.url} className="shrink-0">
                      <Plus className="size-3.5" /> Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Contact Information</p>
                <p className="text-xs text-gray-500 -mt-2">Displayed on the contact page and website footer.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input value={contactInfo.phone} onChange={(e) => setContactInfo((p) => ({ ...p, phone: e.target.value }))} placeholder="+977 1-4XXXXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value={contactInfo.email} onChange={(e) => setContactInfo((p) => ({ ...p, email: e.target.value }))} placeholder="info@example.com" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input value={contactInfo.address} onChange={(e) => setContactInfo((p) => ({ ...p, address: e.target.value }))} placeholder="Kathmandu, Nepal" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>WhatsApp Number</Label>
                    <Input value={contactInfo.whatsappNumber} onChange={(e) => setContactInfo((p) => ({ ...p, whatsappNumber: e.target.value }))} placeholder="+977 98XXXXXXXX" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Map Embed Code</Label>
                  <Textarea value={contactInfo.mapEmbed} onChange={(e) => setContactInfo((p) => ({ ...p, mapEmbed: e.target.value }))} placeholder="<iframe src=...></iframe>" rows={4} className="font-mono text-xs" />
                  <p className="text-xs text-gray-400">Paste the Google Maps embed iframe code.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Global SEO</p>
                <p className="text-xs text-gray-500 -mt-2">Default meta tags for pages that don&apos;t have their own.</p>

                <div className="space-y-1.5">
                  <Label>Meta Title</Label>
                  <Input value={seo.title} onChange={(e) => setSeo((p) => ({ ...p, title: e.target.value }))} placeholder="Horizon Nepal" />
                  <p className="text-right text-[11px] text-gray-400">{seo.title.length} / 60</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Meta Description</Label>
                  <Textarea value={seo.description} onChange={(e) => setSeo((p) => ({ ...p, description: e.target.value }))} placeholder="Brief description of your site" rows={3} />
                  <p className="text-right text-[11px] text-gray-400">{seo.description.length} / 160</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Meta Keywords</Label>
                  <Input value={seo.keywords} onChange={(e) => setSeo((p) => ({ ...p, keywords: e.target.value }))} placeholder="architecture, construction, Nepal" />
                  <p className="text-xs text-gray-400">Comma-separated keywords for search engines.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scripts" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Script Injection</p>
                <p className="text-xs text-gray-500 -mt-2">Insert tracking codes, analytics, or custom scripts.</p>

                <div className="space-y-1.5">
                  <Label>Head Scripts</Label>
                  <Textarea value={scripts.head} onChange={(e) => setScripts((p) => ({ ...p, head: e.target.value }))}
                    placeholder={`<!-- Google Analytics -->\n<script async src=...><\/script>`}
                    rows={6} className="font-mono text-xs" />
                  <p className="text-xs text-gray-400">Injected before the closing &lt;/head&gt; tag.</p>
                </div>

                <div className="space-y-1.5">
                  <Label>Body Scripts</Label>
                  <Textarea value={scripts.body} onChange={(e) => setScripts((p) => ({ ...p, body: e.target.value }))}
                    placeholder={`<script>\n  console.log("loaded");\n<\/script>`}
                    rows={6} className="font-mono text-xs" />
                  <p className="text-xs text-gray-400">Injected before the closing &lt;/body&gt; tag.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
