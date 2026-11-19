import { navigate } from '../../app/router'
import type { Texts } from '../../shared/i18n/texts'
import { Mascot } from '../../shared/ui/Mascot'
import { GroupLedger } from './GroupLedger'
import { useGroup } from './useGroup'

export function GroupPage({ code, t }: { code: string; t: Texts }) {
  const { group, setGroup, status } = useGroup(code)

  if (status === 'loading' || status === 'waking') {
    return (
      <div className="wrap state" role="status">
        <Mascot className="state-mascot bob" mood="calm" />
        <p>{status === 'waking' ? t.waking : '…'}</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="wrap state">
        <Mascot className="state-mascot" mood="calm" />
        <p>{status === 'missing' ? t.group.notFound : t.offline}</p>
        <button className="btn ghost" onClick={() => navigate('/')}>{t.group.home}</button>
      </div>
    )
  }

  return <GroupLedger group={group} onChange={setGroup} t={t} />
}
