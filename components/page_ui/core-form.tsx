"use client";

import { useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FormHeader } from "@/components/global_ui/form-header";
import { FormTabs } from "@/components/global_ui/form-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichEditor } from "@/components/page_ui/rich-editor";
import { SeoFields } from "@/components/global_ui/seo-fields";
import { StatusBadge } from "@/components/global_ui/status-badge";
import { SOCIAL_PLATFORMS } from "@/lib/social-platforms";
import { settingsSchema } from "@/api/validation/settings";
import { ErrorHandler } from "@/api/ServiceHelper/errorhandler";
import { useSettings, useSettingsMutations } from "@/api/hooks/use-settings-query";
import type { SiteSettingsPayload } from "@/api/types/settings.types";

let _id = 0;
function genId() { return crypto.randomUUID?.() ?? `id-${++_id}`; }

export function CoreForm() {
  const { data: settings, isLoading } = useSettings();
  const { updateMutation } = useSettingsMutations();
  const [companyInfo, setCompanyInfo] = useState({ name: "", description: "" });
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string; id: string }[]>([]);
  const [contactInfo, setContactInfo] = useState({ phone: "", email: "", address: "", mapEmbed: "", whatsappNumber: "" });
  const [seo, setSeo] = useState({ title: "", description: "", keywords: "" });
  const [scripts, setScripts] = useState({ head: "", body: "" });
  const [newLink, setNewLink] = useState({ platform: "", url: "" });
  const [initialized, setInitialized] = useState(false);
  const initialRef = useRef<SiteSettingsPayload | null>(null);

  if (settings && !initialized) {
    const payload: SiteSettingsPayload = {
      company_info: { name: settings.company_info?.name ?? "", description: settings.company_info?.description ?? "" },
      social_links: (settings.social_links ?? []).map((l) => ({ platform: l.platform, url: l.url, id: l.id || genId() })),
      contact_info: { phone: settings.contact_info?.phone ?? "", email: settings.contact_info?.email ?? "", address: settings.contact_info?.address ?? "", mapEmbed: settings.contact_info?.mapEmbed ?? "", whatsappNumber: settings.contact_info?.whatsappNumber ?? "" },
      seo: { title: settings.seo?.title ?? "", description: settings.seo?.description ?? "", keywords: settings.seo?.keywords ?? "" },
      scripts: { head: settings.scripts?.head ?? "", body: settings.scripts?.body ?? "" },
    };
    setCompanyInfo(payload.company_info);
    setSocialLinks(payload.social_links);
    setContactInfo(payload.contact_info);
    setSeo(payload.seo);
    setScripts(payload.scripts);
    initialRef.current = payload;
    setInitialized(true);
  }

  const addSocialLink = () => {
    if (!newLink.platform || !newLink.url) return;
    setSocialLinks((prev) => [...prev, { ...newLink, id: genId() }]);
    setNewLink({ platform: "", url: "" });
  };

  const removeSocialLink = (id: string) => {
    setSocialLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const save = () => {
    const current: SiteSettingsPayload = { company_info: companyInfo, social_links: socialLinks, contact_info: contactInfo, seo, scripts };
    const parsed = settingsSchema.safeParse(current);
    if (!parsed.success) {
      ErrorHandler.toast(parsed.error.issues.map((e) => e.message).join(", "));
      return;
    }

    const initial = initialRef.current;
    if (!initial) return;

    const changed: Partial<SiteSettingsPayload> = {};
    if (JSON.stringify(initial.company_info) !== JSON.stringify(companyInfo)) changed.company_info = companyInfo;
    if (JSON.stringify(initial.social_links) !== JSON.stringify(socialLinks)) changed.social_links = socialLinks;
    if (JSON.stringify(initial.contact_info) !== JSON.stringify(contactInfo)) changed.contact_info = contactInfo;
    if (JSON.stringify(initial.seo) !== JSON.stringify(seo)) changed.seo = seo;
    if (JSON.stringify(initial.scripts) !== JSON.stringify(scripts)) changed.scripts = scripts;

    if (Object.keys(changed).length === 0) {
      ErrorHandler.toast("No changes to save");
      return;
    }

    updateMutation.mutate(changed);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  return (
    <div>
      <FormHeader
        title="Settings"
        subtitle="Site-wide configuration"
        onSave={save}
        saving={updateMutation.isPending}
        saveDisabled={updateMutation.isPending}
        saveLabel="Save Settings"
      />

      <Tabs defaultValue="company" className="w-full flex flex-col">
        <div>
          <FormTabs tabs={[{"value":"company","label":"Company"},{"value":"social","label":"Social Links"},{"value":"contact","label":"Contact Info"},{"value":"seo","label":"SEO"},{"value":"scripts","label":"Scripts"}]} />
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
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-sidebar-primary hover:underline truncate flex-1">{link.url}</a>
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

                <div className="space-y-1.5">
                  <Label>WhatsApp Number</Label>
                  <Input value={contactInfo.whatsappNumber} onChange={(e) => setContactInfo((p) => ({ ...p, whatsappNumber: e.target.value }))} placeholder="+977 98XXXXXXXX" />
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Global SEO</p>
                    <p className="text-xs text-gray-500">Default meta tags for pages that don&apos;t have their own.</p>
                  </div>
                  <StatusBadge active={!!seo.title} activeLabel="Has default" inactiveLabel="No defaults" />
                </div>
                <SeoFields
                  metaTitle={seo.title}
                  metaDescription={seo.description}
                  metaKeywords={seo.keywords}
                  onMetaTitleChange={(v) => setSeo((p) => ({ ...p, title: v }))}
                  onMetaDescriptionChange={(v) => setSeo((p) => ({ ...p, description: v }))}
                  onMetaKeywordsChange={(v) => setSeo((p) => ({ ...p, keywords: v }))}
                  titlePlaceholder="Horizon Nepal"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scripts" className="mt-4">
            <Card className="bg-white border border-gray-200 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Script Injection</p>
                <p className="text-xs text-gray-500 -mt-2">Insert tracking codes, analytics, or custom scripts.</p>

                {[
                  { key: "head" as const, label: "Head Scripts", placeholder: `<!-- Google Analytics -->\n<script async src=...><\/script>`, hint: "Injected before the closing </head> tag." },
                  { key: "body" as const, label: "Body Scripts", placeholder: `<script>\n  console.log("loaded");\n<\/script>`, hint: "Injected before the closing </body> tag." },
                ].map((f) => (
                  <div key={f.key} className="space-y-1.5">
                    <Label>{f.label}</Label>
                    <Textarea value={scripts[f.key]} onChange={(e) => setScripts((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={6} className="font-mono text-xs" />
                    <p className="text-xs text-gray-400">{f.hint}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
