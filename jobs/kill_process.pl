#!/usr/bin/perl

use strict;
use warnings;
use Proc::ProcessTable;

my $table = Proc::ProcessTable->new;

my @pm2ids = ();
my $foundpm2 = 0;
my $foundredis = 0;
my $foundjobsidekiq = 0;
my $foundDataProcessor = 0;
my $datestring = localtime();


print "\n------------kill process script started---------";
for my $process (@{$table->table}) {
    # Skip root processes
    # next if $process->uid == 0 or $process->gid == 0;
    # Skip anything other than Passenger application processes

    if ($process->cmndline =~ /redis/) {
        print "Found Redis YAY!!!\n";
        print "\n", $datestring;
        $foundredis = 1;
        # if ($process->cmndline =~ m/0 of 1/ || $process->cmndline =~ m/1 of 1/) {
        #       $foundjobsidekiq = 1;
        # }
    }

    # print "\n \n ", $process->fname, $process->uid, "\n \n";
    if ($process->uid!=0 && ($process->fname =~ /PM2 v4.1.2/)) {
        print "Found PM2, YAY!!!";
        print "Found DataProcessor ", $process->uid, $process->cmndline, "\n";
        $foundpm2 =  $foundpm2 + 1; # For checking only one PM2 God Deamon
        my $ppid = $process->pid;
        push @pm2ids, $ppid;
        print $process->uid;
        # Skip any using less than 1 GiB
        print  "\n ----- PM2 Memory Usage ---->", $process->rss;
        print " ----  $ppid";
        print " ----- PM2 Memory Usage ---- \n";


        # 1GB Memory limit / pm2 process 
        next if $process->rss < 1_073_741_824; 
        print "------- \n ------";

        # Document the slaughter
        (my $cmd = $process->cmndline) =~ s/\s+\z//;
        print "\n", $datestring;
        print " \n Killing process: pid=", $process->pid, " uid=", $process->uid, " rss=", $process->rss, " fname=", $process->fname, " cmndline=", 
        $cmd, $datestring, "\n";
        print  "\n Memory Usage", $process->rss;
        print "------- \n ------";
        system('pm2 delete all');

        # Try first to terminate process politely
        # kill 15, $process->pid;
        # Wait a little, then kill ruthlessly if it's still around
        # sleep 5;
        kill 9, $process->pid;

        # print "PM2 Restarting \n", $datestring  ;
        # sleep 5;
        # system("kill -9 $(lsof -sTCP:LISTEN -i:5000 -t)");
        # system("pm2 delete all");
        # system('cd ~/mult-deployment/deployment-scripts && ./node_deployer restart master');
    }

    # if ($process->fname =~ /sidekiq/ and $process->cmndline =~ /sidekiq 4.1.1 dipper-app [0 of 5 busy]/) {}
    if ($process->cmndline =~ /sidekiq/) {
        print "Found Sidekiq, YAY!!!\n";
        print $datestring, "\n";
        print $process->cmndline;
        print $process->fname;
        print $process->pid;
        ++$foundjobsidekiq;
        # if ($process->cmndline =~ m/0 of 1/ || $process->cmndline =~ m/1 of 1/) {
        #       $foundjobsidekiq = 1;
        # }
    }

    #print "\n", $process->fname, $process->cmndline;
    if ($process->cmndline =~ /DataProcessors/) {
      $foundDataProcessor = 1;
    }

    # 1GB Memory limit Rails app
    if ($process->fname =~ /ruby/ and $process->cmndline =~ /Passenger RubyApp/) {
        print $process->rss;
        next if $process->rss < 1_073_741_824;
        #next if $process->pid != 8156 ;
        (my $cmd = $process->cmndline) =~ s/\s+\z//;

        while (my($key, $value) = each (%apps)) { 
            $value = $apps{$key};
            if ($process->cmndline =~ /$key/) {
                print $process->pid;
                print "Killing Rails App $key \n",  $datestring, "\n", $process->pid;
                kill 15, $process->pid;
                kill 9, $process->pid;

                # my $folder = "/home/ec2-user/$key";
                # my $test_cmd = "cd $folder  ls -la";
                # my $stop_cmd = "cd $folder && rvmsudo passenger stop -p $value";
                # my $start_cmd = "cd $folder && rvmsudo passenger start -p $value  --max-pool-size=3 > /dev/null 2>&1 &";
                # print $stop_cmd, $start_cmd;
                # system($test_cmd);
                # system($stop_cmd);
                # system($start_cmd);

            }
        }
    }
}

if ($foundredis == 0) {
    print "Redis NOT Found, Restarting \n", $datestring  ;
    system('redis-server');
    print "redis NOT Found, Restarted \n", $datestring  ;
}

print "Found no. of instances of pm2 = ",  $foundpm2;
print "\n Active PM2 PIDS: \n", @pm2ids;
print "\n";
if ($foundpm2 != 1) {
    #start pm2 slaughter
    #print "\n \n \n Hi this is the value of no of instances", $foundpm2, "\n \n \n";
    foreach my $kill_pm2id (@pm2ids) {
        print "Killing : " , $kill_pm2id, "\n";
        kill 15, $kill_pm2id;
        kill 9, $kill_pm2id;
    }
}
#print "\n \n \n Hi this is the value of no of instances", $foundpm2, "\n \n \n";
#end pm2 slaughter

#my($to_address) = "support.tech@gmail.com";
#open (MAIL, "|$mailprog -t $to_address") || die "Can't open $mailprog!\n";
#print MAIL "To: $to_address\n";
#print MAIL "From: $from_address\n";
#print MAIL "Subject: Node Server Script Mail - ";
#print MAIL "Test";
#print MAIL "Body";
#close (MAIL);