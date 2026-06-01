import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { BOCard, BOSectionHeader, BOField, BOInput, BOSaveButton, BOAlert, useSaveState } from '../components/BOUtils';
import ArrayEditor, { PairEditor } from '../components/ArrayEditor';
import ImageUpload from '../components/ImageUpload';
import BlockEditor from '../components/BlockEditor';
import AppearanceEditor from '../components/AppearanceEditor';
import { Plus, Pencil, Trash2, ChevronLeft, Eye, Wand2 } from 'lucide-react';
import type { Block, Appearance } from '../../../lib/blocks';
import { freshId } from '../components/blockDefaults';
import { normalizeBlocks } from '../../../lib/blocks';

type Kind = 'journal' | 'activity';
type Mode = 'list' | 'edit' | 'create';
type Filter = 'all' | Kind;

interface Post {
  id: string;
  slug: string;
  kind: Kind;
  title: string;
  date: string;
  cover_image: string;
  excerpt: string;
  is_featured: boolean;
  sort_order: number;
  category: string | null;
  reading_time: string | null;
  activity_type: string | null;
  status: string | null;
  long_description: string | null;
  impact: string | null;
  content_blocks?: Block[] | null;
  appearance?: Appearance | null;
  created_at?: string;
  updated_at?: string;
}

const emptyForm = (kind: Kind) => ({
  slug: '',
  kind,
  title: '',
  date: '',
  cover_image: '',
  excerpt: '',
  is_featured: false,
  sort_order: 0,
  category: '',
  reading_time: kind === 'journal' ? '5 min read' : '',
  activity_type: kind === 'activity' ? 'Experiment' : '',
  status: '',
  long_description: '',
  impact: '',
});

const KIND_BADGE: Record<Kind, string> = {
  journal: 'bg-[#84CC16]/15 text-[#a0e040]',
  activity: 'bg-blue-500/20 text-blue-400',
};

const ACTIVITY_TYPE_BADGE: Record<string, string> = {
  Insight: 'bg-blue-500/20 text-blue-400',
  Event: 'bg-purple-500/20 text-purple-400',
  Experiment: 'bg-yellow-500/20 text-yellow-400',
};

export default function PostsEditor({ onSaved }: { onSaved?: () => void }) {
  const [mode, setMode] = useState<Mode>('list');
  const [filter, setFilter] = useState<Filter>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [selected, setSelected] = useState<Post | null>(null);
  const [form, setForm] = useState<any>(emptyForm('journal'));
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [links, setLinks] = useState<{ label: string; value: string }[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [appearance, setAppearance] = useState<Appearance | null>(null);
  const { saving, saved, error, withSave } = useSaveState();

  const load = async () => {
    const { data } = await supabase.from('posts').select('*').order('sort_order');
    setPosts((data as Post[]) || []);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => filter === 'all' ? posts : posts.filter(p => p.kind === filter),
    [posts, filter]
  );

  const counts = useMemo(() => ({
    all: posts.length,
    journal: posts.filter(p => p.kind === 'journal').length,
    activity: posts.filter(p => p.kind === 'activity').length,
  }), [posts]);

  const openCreate = (kind: Kind) => {
    setSelected(null);
    setForm(emptyForm(kind));
    setParagraphs([]);
    setTags([]);
    setLinks([]);
    setBlocks([]);
    setAppearance(null);
    setMode('create');
  };

  const openEdit = async (post: Post) => {
    setSelected(post);
    setForm({ ...post, category: post.category || '', reading_time: post.reading_time || '', activity_type: post.activity_type || '', status: post.status || '', long_description: post.long_description || '', impact: post.impact || '' });
    setBlocks(normalizeBlocks(post.content_blocks));
    setAppearance(post.appearance || null);
    if (post.kind === 'journal') {
      const [c, t] = await Promise.all([
        supabase.from('post_paragraphs').select('*').eq('post_id', post.id).order('sort_order'),
        supabase.from('post_tags').select('*').eq('post_id', post.id),
      ]);
      setParagraphs((c.data || []).map((p: any) => p.paragraph));
      setTags((t.data || []).map((t: any) => t.tag));
      setLinks([]);
    } else {
      const { data } = await supabase.from('post_links').select('*').eq('post_id', post.id).order('sort_order');
      setLinks((data || []).map((l: any) => ({ label: l.label, value: l.url })));
      setParagraphs([]);
      setTags([]);
    }
    setMode('edit');
  };

  const saveRelations = async (postId: string, kind: Kind) => {
    if (kind === 'journal') {
      await supabase.from('post_paragraphs').delete().eq('post_id', postId);
      await supabase.from('post_tags').delete().eq('post_id', postId);
      if (paragraphs.filter(Boolean).length > 0)
        await supabase.from('post_paragraphs').insert(
          paragraphs.filter(Boolean).map((p, i) => ({ post_id: postId, paragraph: p, sort_order: i }))
        );
      if (tags.filter(Boolean).length > 0)
        await supabase.from('post_tags').insert(
          tags.filter(Boolean).map(t => ({ post_id: postId, tag: t }))
        );
    } else {
      await supabase.from('post_links').delete().eq('post_id', postId);
      if (links.filter(l => l.label).length > 0)
        await supabase.from('post_links').insert(
          links.filter(l => l.label).map((l, i) => ({ post_id: postId, label: l.label, url: l.value, sort_order: i }))
        );
    }
  };

  const handleSave = () => withSave(async () => {
    const kind: Kind = form.kind;
    const payload: any = {
      slug: form.slug,
      kind,
      title: form.title,
      date: form.date,
      cover_image: form.cover_image || null,
      excerpt: form.excerpt || null,
      is_featured: !!form.is_featured,
      sort_order: Number(form.sort_order) || 0,
      category: kind === 'journal' ? (form.category || null) : null,
      reading_time: kind === 'journal' ? (form.reading_time || null) : null,
      activity_type: kind === 'activity' ? (form.activity_type || null) : null,
      status: kind === 'activity' ? (form.status || null) : null,
      long_description: kind === 'activity' ? (form.long_description || null) : null,
      impact: kind === 'activity' ? (form.impact || null) : null,
      content_blocks: blocks,
      appearance: appearance,
      updated_at: new Date().toISOString(),
    };

    if (mode === 'create') {
      const { data, error: err } = await supabase.from('posts').insert(payload).select().single();
      if (err) throw err;
      await saveRelations(data.id, kind);
    } else {
      const { error: err } = await supabase.from('posts').update(payload).eq('id', selected!.id);
      if (err) throw err;
      await saveRelations(selected!.id, kind);
    }
    await load();
    onSaved?.();
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await supabase.from('posts').delete().eq('id', id);
    await load();
  };

  const set = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  if (mode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <BOSectionHeader title="Journal & Activities" description={`${counts.all} entries — ${counts.journal} journal, ${counts.activity} activity`} />
          <div className="flex items-center gap-2">
            <button onClick={() => openCreate('journal')} className="flex items-center gap-2 bg-[#84CC16] hover:bg-[#76b814] text-black font-semibold text-sm px-3 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Journal
            </button>
            <button onClick={() => openCreate('activity')} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm px-3 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Activity
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2">
          {(['all', 'journal', 'activity'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                filter === f
                  ? 'bg-[#84CC16] text-black font-semibold'
                  : 'bg-[#1a1a1a] text-[#888] hover:text-[#e5e5e5]'
              }`}
            >
              {f === 'all' ? 'All' : f === 'journal' ? 'Journal' : 'Activity'}
              <span className="ml-1.5 opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <BOCard><p className="text-sm text-[#555]">No entries yet.</p></BOCard>
        )}

        {filtered.map(p => (
          <BOCard key={p.id} className="flex items-center gap-4">
            {p.cover_image && (
              <img src={p.cover_image} alt={p.title} className="w-20 h-14 rounded-lg object-cover shrink-0 border border-[#2a2a2a]" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-[#e5e5e5] truncate">{p.title}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${KIND_BADGE[p.kind]}`}>{p.kind === 'journal' ? 'Journal' : 'Activity'}</span>
                {p.kind === 'activity' && p.activity_type && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${ACTIVITY_TYPE_BADGE[p.activity_type] || ''}`}>{p.activity_type}</span>
                )}
                {p.is_featured && <span className="text-[10px] bg-[#84CC16]/20 text-[#84CC16] px-1.5 py-0.5 rounded">Featured</span>}
              </div>
              <p className="text-xs text-[#555] mt-0.5">
                {p.kind === 'journal'
                  ? `${p.category || '—'} · ${p.date} · ${p.reading_time || ''}`
                  : `${p.status || '—'} · ${p.date}`}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a href={`/${p.kind}/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-[#555] hover:text-[#e5e5e5]">
                <Eye className="w-4 h-4" />
              </a>
              <button onClick={() => openEdit(p)} className="p-2 text-[#555] hover:text-[#84CC16]"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(p.id)} className="p-2 text-[#555] hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          </BOCard>
        ))}
      </div>
    );
  }

  const isJournal = form.kind === 'journal';
  const isActivity = form.kind === 'activity';

  const legacySource = isJournal
    ? paragraphs.filter(Boolean).length > 0
    : !!(form.long_description || form.impact);

  const importLegacy = () => {
    const imported: Block[] = [];
    if (isJournal) {
      paragraphs.filter(Boolean).forEach((p) => imported.push({ id: freshId(), type: 'paragraph', text: p }));
    } else {
      if (form.long_description) imported.push({ id: freshId(), type: 'paragraph', text: form.long_description });
      if (form.impact)
        imported.push({ id: freshId(), type: 'callout', variant: 'impact', title: 'Impact & Outcomes', text: form.impact });
    }
    setBlocks([...blocks, ...imported]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setMode('list')} className="flex items-center gap-1.5 text-sm text-[#888] hover:text-[#e5e5e5]">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <span className="text-[#333]">/</span>
        <h2 className="text-lg font-semibold text-[#e5e5e5]">
          {mode === 'create' ? `New ${isJournal ? 'Journal' : 'Activity'}` : `Edit: ${form.title}`}
        </h2>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${KIND_BADGE[form.kind as Kind]}`}>
          {isJournal ? 'Journal' : 'Activity'}
        </span>
      </div>
      {error && <BOAlert message={error} />}

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <BOField label="Title">
            <BOInput value={form.title} onChange={set('title')} placeholder={isJournal ? 'The Future of Interface' : 'Generative Design Patterns'} />
          </BOField>
          <BOField label="Slug">
            <BOInput
              value={form.slug}
              onChange={v => set('slug')(v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
              placeholder={isJournal ? 'future-of-interface' : 'generative-patterns'}
            />
          </BOField>
          <BOField label="Date">
            <BOInput value={form.date} onChange={set('date')} placeholder={isJournal ? 'Dec 14, 2024' : 'Spring 2024'} />
          </BOField>
          <BOField label="Sort Order">
            <BOInput value={String(form.sort_order)} onChange={v => set('sort_order')(Number(v))} type="number" />
          </BOField>

          {isJournal && (
            <>
              <BOField label="Category">
                <BOInput value={form.category} onChange={set('category')} placeholder="Design Theory" />
              </BOField>
              <BOField label="Reading Time">
                <BOInput value={form.reading_time} onChange={set('reading_time')} placeholder="6 min read" />
              </BOField>
            </>
          )}

          {isActivity && (
            <>
              <BOField label="Type">
                <select
                  value={form.activity_type}
                  onChange={e => set('activity_type')(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] focus:outline-none focus:border-[#84CC16]"
                >
                  <option>Insight</option>
                  <option>Event</option>
                  <option>Experiment</option>
                </select>
              </BOField>
              <BOField label="Status">
                <BOInput value={form.status} onChange={set('status')} placeholder="In Progress" />
              </BOField>
            </>
          )}
        </div>

        <div className="mt-4">
          <BOField label={isJournal ? 'Excerpt / Preview' : 'Short Description'}>
            <BOInput
              value={form.excerpt}
              onChange={set('excerpt')}
              rows={2}
              placeholder={isJournal ? 'Short description shown in cards...' : 'Exploring algorithmic textures...'}
            />
          </BOField>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="postfeat"
            checked={form.is_featured}
            onChange={e => set('is_featured')(e.target.checked)}
            className="w-4 h-4 rounded accent-[#84CC16]"
          />
          <label htmlFor="postfeat" className="text-sm text-[#888]">Show in Featured (home page)</label>
        </div>
      </BOCard>

      <BOCard>
        <ImageUpload
          value={form.cover_image}
          onChange={set('cover_image')}
          label="Cover Image"
          bucket={isJournal ? 'journal' : 'activities'}
        />
      </BOCard>

      {isJournal && (
        <>
          <BOCard>
            <h3 className="text-sm font-semibold text-[#e5e5e5] mb-2">Article Content</h3>
            <p className="text-xs text-[#555] mb-4">Each paragraph will be rendered as a separate block.</p>
            <div className="space-y-3">
              {paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    value={p}
                    onChange={e => { const n = [...paragraphs]; n[i] = e.target.value; setParagraphs(n); }}
                    rows={3}
                    placeholder={`Paragraph ${i + 1}...`}
                    className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] placeholder-[#444] focus:outline-none focus:border-[#84CC16] resize-none transition-colors"
                  />
                  <button
                    onClick={() => setParagraphs(paragraphs.filter((_, idx) => idx !== i))}
                    className="p-1.5 text-[#555] hover:text-red-400 self-start mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setParagraphs([...paragraphs, ''])}
              className="mt-2 flex items-center gap-1.5 text-xs text-[#84CC16] hover:text-[#a0e040]"
            >
              <Plus className="w-3.5 h-3.5" /> Add paragraph
            </button>
          </BOCard>

          <BOCard>
            <ArrayEditor label="Tags" items={tags} onChange={setTags} placeholder="Interface" addLabel="Add tag" />
          </BOCard>
        </>
      )}

      {isActivity && (
        <>
          <BOCard>
            <div className="space-y-4">
              <BOField label="Long Description">
                <BOInput value={form.long_description} onChange={set('long_description')} rows={4} placeholder="Full context of this activity..." />
              </BOField>
              <BOField label="Impact (optional)">
                <BOInput value={form.impact} onChange={set('impact')} rows={2} placeholder="Outcomes & metrics..." />
              </BOField>
            </div>
          </BOCard>

          <BOCard>
            <PairEditor
              label="Links"
              items={links}
              onChange={setLinks}
              labelPlaceholder="Link label"
              valuePlaceholder="https://..."
              addLabel="Add link"
            />
          </BOCard>
        </>
      )}

      <BOCard>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-[#e5e5e5]">Flexible Content Blocks</h3>
            <p className="text-xs text-[#555] mt-1">
              Compose the page freely — headings, rich paragraphs, images, galleries, code, callouts and more.
              {blocks.length > 0 ? ' These render instead of the simple fields above.' : ''}
            </p>
          </div>
          {legacySource && (
            <button
              onClick={importLegacy}
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#84CC16] transition-colors shrink-0"
              title="Append the simple fields above as editable blocks"
            >
              <Wand2 className="w-3.5 h-3.5" /> Import existing text
            </button>
          )}
        </div>
        <BlockEditor value={blocks} onChange={setBlocks} bucket={isJournal ? 'journal' : 'activities'} label="" />
      </BOCard>

      <BOCard>
        <h3 className="text-sm font-semibold text-[#e5e5e5] mb-4">Appearance</h3>
        <AppearanceEditor value={appearance} onChange={setAppearance} headerStyle={isJournal} decor={isActivity} />
      </BOCard>

      <BOSaveButton
        onClick={handleSave}
        loading={saving}
        saved={saved}
        label={mode === 'create' ? `Create ${isJournal ? 'Journal' : 'Activity'}` : 'Save Changes'}
      />
    </div>
  );
}
