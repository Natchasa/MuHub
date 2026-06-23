#!/usr/bin/perl
use strict;
use warnings;
use HTTP::Daemon;
use HTTP::Status;
use Cwd 'abs_path';

my $port = $ARGV[0] || 3737;

# Get absolute path of this script's directory
my $script = abs_path(__FILE__);
$script =~ s|[/\\][^/\\]+$||;  # strip filename
my $root = $script;

print "Root: $root\n";
print "Serving on http://localhost:$port/\n";

my $d = HTTP::Daemon->new(LocalPort => $port, ReuseAddr => 1)
    or die "Cannot start server on port $port: $!";

my %mime = (
    html => 'text/html; charset=utf-8',
    js   => 'application/javascript',
    css  => 'text/css',
    png  => 'image/png',
    jpg  => 'image/jpeg',
    ico  => 'image/x-icon',
    json => 'application/json',
    txt  => 'text/plain',
);

while (my $c = $d->accept) {
    while (my $r = $c->get_request) {
        my $path = $r->uri->path;
        $path = '/index.html' if $path eq '/';
        $path =~ s|^/||;
        $path =~ s|\.\.||g;
        my $file = "$root/$path";

        if (-f $file) {
            my ($ext) = lc($file) =~ /\.(\w+)$/;
            my $ct = $mime{$ext || ''} || 'application/octet-stream';
            open my $fh, '<:raw', $file or do { $c->send_error(RC_INTERNAL_SERVER_ERROR); next };
            local $/; my $body = <$fh>; close $fh;
            my $res = HTTP::Response->new(200);
            $res->header('Content-Type' => $ct);
            $res->content($body);
            $c->send_response($res);
        } else {
            print "404: $file\n";
            $c->send_error(RC_NOT_FOUND);
        }
    }
    $c->close;
}
