// Image files live under assets/ (full art) and assets/portraits/ (full-body battle portraits).
const fullArtUrl=i=>'assets/'+artNames[i]+'.webp';
const portraitUrl=i=>'assets/'+(fullBodyPortraits.has(i)?'portraits/':'')+artNames[i]+'.webp';
